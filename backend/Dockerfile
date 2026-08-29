# 1. Define a imagem de origem base
FROM node:24-alpine

# 2. Define o diretório de trabalho interno do container
WORKDIR /app

# 3. Instalar o pnpm globalmente para gerenciar as dependências
RUN npm install -g pnpm@11.20

# 3. Desativa a restrição do pnpm 11
RUN echo "strictDepBuilds: false" > pnpm-workspace.yaml

# 4. Copia apenas o manifesto de dependências
COPY package.json ./

# 5. Instalar as dependências do projeto
RUN pnpm install

# 6. Copiar todo o restante do código
COPY . .

# 7. Expoe a porta padrão LDW
EXPOSE 3000

# 8. Comando para inicializar a aplicação
CMD ["pnpm", "dev"]
