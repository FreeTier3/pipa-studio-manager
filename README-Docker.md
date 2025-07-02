
# Pipa Studios - Executar no Docker (Windows)

## Pré-requisitos

1. **Docker Desktop para Windows** instalado e em execução
   - Download: https://www.docker.com/products/docker-desktop

## Como usar

### Opção 1: Scripts automatizados (Recomendado)

1. **Iniciar a aplicação:**
   ```
   Clique duas vezes em: docker-start.bat
   ```

2. **Parar a aplicação:**
   ```
   Clique duas vezes em: docker-stop.bat
   ```

### Opção 2: Comandos manuais

1. **Abrir PowerShell ou Command Prompt na pasta do projeto**

2. **Construir e iniciar:**
   ```bash
   docker-compose up --build -d
   ```

3. **Acessar a aplicação:**
   ```
   http://localhost:8080
   ```

4. **Parar a aplicação:**
   ```bash
   docker-compose down
   ```

## Comandos úteis

- **Ver logs da aplicação:**
  ```bash
  docker-compose logs -f
  ```

- **Reiniciar a aplicação:**
  ```bash
  docker-compose restart
  ```

- **Remover containers e volumes:**
  ```bash
  docker-compose down -v
  ```

## Troubleshooting

- **Se o Docker não iniciar:** Verifique se o Docker Desktop está rodando
- **Porta 8080 ocupada:** Mude a porta no docker-compose.yml (ex: "8081:8080")
- **Problemas de build:** Execute `docker system prune -a` para limpar cache

## Dados persistentes

Os dados da aplicação são salvos no volume `data` e persistem mesmo após reiniciar o container.
