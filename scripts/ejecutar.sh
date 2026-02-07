
#!/bin/bash
# ============================================================================
# SCRIPT DE MIGRACIONES - Movilidad
# ============================================================================
#
# DESCRIPCIÓN:
#   Ejecuta los scripts SQL de migración en la base de datos PostgreSQL.
#   Lee automáticamente las credenciales desde .env.local
#
# USO:
#   ./scripts/ejecutar.sh                         # Ejecuta TODAS las migraciones
#   ./scripts/ejecutar.sh 03_modulo-parqueadero   # Ejecuta solo un módulo
#   ./scripts/ejecutar.sh --clean                 # Limpia la BD (¡PELIGROSO!)
#   ./scripts/ejecutar.sh --help                  # Muestra esta ayuda
#
# TAMBIÉN PUEDES USAR NPM:
#   npm run db:migrate                # Ejecuta todas las migraciones
#   npm run db:migrate:parqueadero    # Ejecuta solo parqueadero
#   npm run db:clean                  # Limpia la BD
#
# REQUISITOS:
#   1. PostgreSQL client (psql) instalado
#      - Ubuntu/Debian: sudo apt-get install postgresql-client
#      - Mac: brew install postgresql
#
#   2. Archivo .env.local con las credenciales de Supabase
#      El script busca automáticamente estas variables:
#      - SUPABASE_POSTGRES_URL_NON_POOLING (preferida)
#      - SUPABASE_POSTGRES_URL
#      - DATABASE_URL
#
# ESTRUCTURA DE CARPETAS:
#   scripts/
#   ├── 00_configuracion/      # Configuración inicial (timezone, etc.)
#   │   ├── 01_config/
#   │   └── 99_utilities/      # ⚠️ NO se ejecuta automáticamente
#   ├── 01_sistema-usuarios/   # Tablas de usuarios, perfiles, roles
#   ├── 02_modulo-movilidad/   # Módulo de movilidad
#   ├── 03_modulo-parqueadero/ # Módulo de parqueadero (inspecciones)
#   └── 99_vistas_finales/     # Vistas que dependen de todo lo anterior
#
# NOTAS:
#   - Las carpetas 99_utilities NO se ejecutan (son herramientas manuales)
#   - 99_vistas_finales se ejecuta AL FINAL de todo
#   - Los scripts se ejecutan en orden alfabético
#   - Si un script falla, la ejecución se detiene
#
# ============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio de scripts
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPTS_DIR")"

# Cargar .env.local si existe
if [ -f "$PROJECT_DIR/.env.local" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env.local" | grep -v '^$' | xargs)
fi

# Usar SUPABASE_POSTGRES_URL_NON_POOLING si DATABASE_URL no está definida
if [ -z "$DATABASE_URL" ]; then
    if [ -n "$SUPABASE_POSTGRES_URL_NON_POOLING" ]; then
        DATABASE_URL="$SUPABASE_POSTGRES_URL_NON_POOLING"
    elif [ -n "$SUPABASE_POSTGRES_URL" ]; then
        DATABASE_URL="$SUPABASE_POSTGRES_URL"
    fi
fi

# Función para mostrar ayuda
mostrar_ayuda() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Script de Migraciones - Movilidad${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}USO:${NC}"
    echo "  ./scripts/ejecutar.sh [opción|módulo]"
    echo ""
    echo -e "${BLUE}OPCIONES:${NC}"
    echo "  (sin argumentos)    Ejecuta TODAS las migraciones en orden"
    echo "  --clean, --limpiar  Limpia la base de datos (requiere confirmación)"
    echo "  --help, -h          Muestra esta ayuda"
    echo "  --status            Muestra el estado de la conexión"
    echo ""
    echo -e "${BLUE}MÓDULOS DISPONIBLES:${NC}"
    for dir in "$SCRIPTS_DIR"/[0-9]*/; do
        if [ -d "$dir" ]; then
            nombre=$(basename "$dir")
            if [[ "$nombre" != "99_"* ]]; then
                echo "  $nombre"
            fi
        fi
    done
    echo ""
    echo -e "${BLUE}COMANDOS NPM:${NC}"
    echo "  npm run db:migrate              # Ejecuta todas las migraciones"
    echo "  npm run db:migrate:parqueadero  # Ejecuta solo parqueadero"
    echo "  npm run db:clean                # Limpia la BD"
    echo ""
    echo -e "${BLUE}EJEMPLOS:${NC}"
    echo "  ./scripts/ejecutar.sh                         # Todo"
    echo "  ./scripts/ejecutar.sh 03_modulo-parqueadero   # Solo parqueadero"
    echo "  ./scripts/ejecutar.sh 01_sistema-usuarios     # Solo usuarios"
    echo ""
    echo -e "${YELLOW}NOTA:${NC} El script lee las credenciales de .env.local automáticamente"
    echo ""
}

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  Error: No se encontraron credenciales de base de datos     ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "El script busca estas variables en .env.local:"
    echo "  - SUPABASE_POSTGRES_URL_NON_POOLING"
    echo "  - SUPABASE_POSTGRES_URL"
    echo "  - DATABASE_URL"
    echo ""
    echo "Asegúrate de tener el archivo .env.local con las credenciales de Supabase"
    exit 1
fi

# Verificar que psql está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  Error: psql no está instalado                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Instálalo con:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  Mac:           brew install postgresql"
    exit 1
fi

# Función para ejecutar un archivo SQL
ejecutar_sql() {
    local archivo="$1"
    local nombre=$(basename "$archivo")
    echo -e "  ${BLUE}→${NC} $nombre"

    if ! psql "$DATABASE_URL" -f "$archivo" -v ON_ERROR_STOP=1 > /tmp/sql_output.txt 2>&1; then
        echo -e "  ${RED}✗ Error en $nombre${NC}"
        cat /tmp/sql_output.txt
        exit 1
    fi
}

# Función para ejecutar una carpeta de scripts
ejecutar_carpeta() {
    local carpeta="$1"
    local nombre=$(basename "$carpeta")

    if [ ! -d "$carpeta" ]; then
        echo -e "${YELLOW}Carpeta no encontrada: $carpeta${NC}"
        return
    fi

    echo -e "${GREEN}━━━ $nombre ━━━${NC}"

    # Buscar subcarpetas en orden
    for subcarpeta in $(find "$carpeta" -mindepth 1 -maxdepth 1 -type d | sort); do
        local subnombre=$(basename "$subcarpeta")

        # Saltar carpetas de utilidades (99_utilities, etc.)
        if [[ "$subnombre" == *"utilities"* ]] || [[ "$subnombre" == "99_"* ]]; then
            echo -e "${YELLOW}  [SKIP] $subnombre (utilidades manuales)${NC}"
            continue
        fi

        echo -e "${BLUE}  [$subnombre]${NC}"

        # Ejecutar archivos SQL en orden
        for archivo in $(find "$subcarpeta" -name "*.sql" -type f | sort); do
            ejecutar_sql "$archivo"
        done
    done

    # También ejecutar archivos SQL sueltos en la raíz de la carpeta
    for archivo in $(find "$carpeta" -maxdepth 1 -name "*.sql" -type f | sort); do
        ejecutar_sql "$archivo"
    done

    echo ""
}

# Función para limpiar la BD
limpiar_bd() {
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         ⚠️  ADVERTENCIA: LIMPIEZA DE BASE DE DATOS ⚠️         ║${NC}"
    echo -e "${RED}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${RED}║  Esto eliminará TODOS los datos y estructuras.              ║${NC}"
    echo -e "${RED}║  Esta acción NO se puede deshacer.                          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "Escribe 'SI_ESTOY_SEGURO' para continuar: " confirmacion

    if [ "$confirmacion" != "SI_ESTOY_SEGURO" ]; then
        echo -e "${YELLOW}Operación cancelada${NC}"
        exit 0
    fi

    echo -e "${YELLOW}Limpiando base de datos...${NC}"
    psql "$DATABASE_URL" -c "SET app.allow_db_wipe = 'SI_ESTOY_SEGURO';" -f "$SCRIPTS_DIR/00_configuracion/99_utilities/001_limpiar_bd.sql"
    echo -e "${GREEN}✓ Base de datos limpiada${NC}"
}

# Función para mostrar estado
mostrar_estado() {
    echo -e "${BLUE}Verificando conexión...${NC}"
    if psql "$DATABASE_URL" -c "SELECT 'Conexión exitosa' as estado, current_database() as bd, current_user as usuario;" 2>/dev/null; then
        echo -e "${GREEN}✓ Conexión OK${NC}"
    else
        echo -e "${RED}✗ Error de conexión${NC}"
        exit 1
    fi
}

# Procesar argumentos
case "$1" in
    --clean|--limpiar)
        limpiar_bd
        ;;
    --help|-h)
        mostrar_ayuda
        ;;
    --status|--estado)
        mostrar_estado
        ;;
    "")
        # Ejecutar todo en orden
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           Ejecutando migraciones de base de datos           ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""

        for carpeta in $(find "$SCRIPTS_DIR" -mindepth 1 -maxdepth 1 -type d -name "[0-9]*" | sort); do
            nombre_carpeta=$(basename "$carpeta")
            # Saltar carpetas de utilidades y vistas finales (se ejecutan aparte)
            if [[ "$nombre_carpeta" == *"utilities"* ]] || [[ "$nombre_carpeta" == "99_"* ]]; then
                continue
            fi
            ejecutar_carpeta "$carpeta"
        done

        # Ejecutar vistas finales al final
        if [ -d "$SCRIPTS_DIR/99_vistas_finales" ]; then
            ejecutar_carpeta "$SCRIPTS_DIR/99_vistas_finales"
        fi

        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ✓ Migraciones completadas                       ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
        ;;
    *)
        # Ejecutar un módulo específico
        if [ -d "$SCRIPTS_DIR/$1" ]; then
            ejecutar_carpeta "$SCRIPTS_DIR/$1"
            echo -e "${GREEN}✓ Módulo $1 completado${NC}"
        else
            echo -e "${RED}Módulo no encontrado: $1${NC}"
            echo ""
            echo "Módulos disponibles:"
            for dir in "$SCRIPTS_DIR"/[0-9]*/; do
                if [ -d "$dir" ]; then
                    echo "  $(basename "$dir")"
                fi
            done
            echo ""
            echo "Usa --help para ver todas las opciones"
            exit 1
        fi
        ;;
esac
