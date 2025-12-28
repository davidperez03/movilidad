#!/usr/bin/env python3
"""
Web scraper para el directorio de actores de RUNT (Colombia)
Extrae información de organismos de tránsito
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import json
from typing import List, Dict

class RUNTScraper:
    def __init__(self):
        self.base_url = "https://www.runt.gov.co/index.php/directorio-de-actores"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def extraer_datos_organismo(self, article) -> Dict[str, str]:
        """
        Extrae los datos de un organismo desde un elemento article
        """
        datos = {
            'nombre': '',
            'tipo': '',
            'telefono': '',
            'direccion': '',
            'municipio': '',
            'departamento': ''
        }

        # Nombre del organismo
        nombre_elem = article.find('span', class_='field--name-title')
        if nombre_elem:
            datos['nombre'] = nombre_elem.get_text(strip=True)

        # Tipo de organismo
        tipo_elem = article.find('div', class_='pxc-directorio-tipo')
        if tipo_elem:
            tipo_div = tipo_elem.find('div')
            if tipo_div:
                datos['tipo'] = tipo_div.get_text(strip=True)

        # Teléfono
        telefono_elem = article.find('div', class_='pxc-telefono')
        if telefono_elem:
            telefono_divs = telefono_elem.find_all('div', recursive=True)
            for div in telefono_divs:
                texto = div.get_text(strip=True)
                if texto and texto != 'Teléfono' and not div.find('div'):
                    datos['telefono'] = texto
                    break

        # Dirección
        direccion_elem = article.find('div', class_='pxc-direccion')
        if direccion_elem:
            direccion_divs = direccion_elem.find_all('div', recursive=True)
            for div in direccion_divs:
                texto = div.get_text(strip=True)
                if texto and texto != 'Dirección' and not div.find('div'):
                    datos['direccion'] = texto
                    break

        # Municipio
        municipio_elem = article.find('div', class_='pxc-municipio')
        if municipio_elem:
            municipio_div = municipio_elem.find('div')
            if municipio_div:
                municipio_texto = municipio_div.get_text(strip=True)
                # Eliminar el departamento si viene en el formato "MUNICIPIO - DEPARTAMENTO"
                if ' - ' in municipio_texto:
                    datos['municipio'] = municipio_texto.split(' - ')[0]
                else:
                    datos['municipio'] = municipio_texto

        # Departamento
        departamento_elem = article.find('div', class_='pxc-departamento')
        if departamento_elem:
            departamento_div = departamento_elem.find('div')
            if departamento_div:
                datos['departamento'] = departamento_div.get_text(strip=True)

        return datos

    def scrape_pagina(self, page_num: int = 0, tipo: int = 15) -> List[Dict[str, str]]:
        """
        Scrape una página específica
        tipo: 15 = Organismos de Tránsito
        """
        params = {
            'nombre': '',
            'tipo': tipo,
            'departamento': 'All',
            'municipio': 'All',
            'field_nit_value': '',
            'page': page_num
        }

        try:
            print(f"Scrapeando página {page_num}...")
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Buscar todos los artículos
            articles = soup.find_all('article', class_='pxc-articulo-fila')

            organismos = []
            for article in articles:
                datos = self.extraer_datos_organismo(article)
                if datos['nombre']:  # Solo agregar si tiene nombre
                    organismos.append(datos)
                    print(f"  Extraído: {datos['nombre']}")

            return organismos

        except requests.RequestException as e:
            print(f"Error al hacer la petición: {e}")
            return []

    def scrape_todo(self, max_pages: int = None, tipo: int = 15) -> List[Dict[str, str]]:
        """
        Scrape todas las páginas disponibles
        """
        todos_organismos = []
        page = 0

        while True:
            if max_pages and page >= max_pages:
                break

            organismos = self.scrape_pagina(page, tipo)

            if not organismos:
                print(f"No se encontraron más organismos en la página {page}. Finalizando...")
                break

            todos_organismos.extend(organismos)
            page += 1

            # Pausa entre peticiones para no sobrecargar el servidor
            time.sleep(2)

        return todos_organismos

    def guardar_csv(self, organismos: List[Dict[str, str]], filename: str = 'organismos_transito.csv'):
        """
        Guarda los datos en un archivo CSV
        """
        if not organismos:
            print("No hay datos para guardar")
            return

        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['nombre', 'tipo', 'telefono', 'direccion', 'municipio', 'departamento']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for organismo in organismos:
                writer.writerow(organismo)

        print(f"\nDatos guardados en {filename}")
        print(f"Total de organismos: {len(organismos)}")

    def guardar_json(self, organismos: List[Dict[str, str]], filename: str = 'organismos_transito.json'):
        """
        Guarda los datos en un archivo JSON
        """
        if not organismos:
            print("No hay datos para guardar")
            return

        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(organismos, jsonfile, ensure_ascii=False, indent=2)

        print(f"Datos guardados en {filename}")


def main():
    scraper = RUNTScraper()

    print("=== Scraper de Directorio RUNT ===")
    print("Tipo: Organismos de Tránsito (tipo=15)")
    print()

    # Opción 1: Scrape una sola página (para probar)
    # organismos = scraper.scrape_pagina(page_num=0)

    # Opción 2: Scrape todas las páginas
    # Puedes limitar el número de páginas con max_pages=N si es necesario
    organismos = scraper.scrape_todo()  # Scrapeará todas las páginas disponibles

    # Guardar en CSV
    scraper.guardar_csv(organismos)

    # Guardar en JSON (opcional)
    scraper.guardar_json(organismos)

    print("\n¡Scraping completado!")


if __name__ == "__main__":
    main()
