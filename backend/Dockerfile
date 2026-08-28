<<<<<<< HEAD
# 1. Define a imagem de origem base
FROM node:24-alpine

# 2. Define o diretório de trabalho interno do container
=======
# 1. Define a imagem de origem base 
FROM node:24-alpine

# 2. Define diretório de trabalho interno do container
>>>>>>> 371c1da40b7f2550f7207205d00dd77f58482301
WORKDIR /app

# 3. Instalar o pnpm globalmente para gerenciar as dependências
RUN npm install -g pnpm@11.20

<<<<<<< HEAD
# 3. Desativa a restrição do pnpm 11
=======
# Desativa a restrição do pnpm 11
>>>>>>> 371c1da40b7f2550f7207205d00dd77f58482301
RUN echo "strictDepBuilds: false" > pnpm-workspace.yaml

# 4. Copia apenas o manifesto de dependências
COPY package.json ./

# 5. Instalar as dependências do projeto
RUN pnpm install

<<<<<<< HEAD
# 6. Copiar todo o restante do código
=======
# 6. Copiat todo os restante do código
>>>>>>> 371c1da40b7f2550f7207205d00dd77f58482301
COPY . .

# 7. Expoe a porta padrão LDW
EXPOSE 3000

# 8. Comando para inicializar a aplicação
<<<<<<< HEAD
CMD ["pnpm", "dev"]
=======
CMD ["pnpm", "dev"]

>>>>>>> 371c1da40b7f2550f7207205d00dd77f58482301
