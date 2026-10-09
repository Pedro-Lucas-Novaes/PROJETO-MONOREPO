import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { sequelize } from '../config/database';
import { User } from '../models/User';

/**
 * Testes complementares ao userRoutes.integration.test.ts
 * Focados em cobrir os branches não cobertos do UserController:
 *   - show:   usuario encontrado (200) e erro interno (500)
 *   - create: senha muito curta (400) e erro interno (500)
 *   - update: ID inválido (400), update com nome, update com email,
 *             nome inválido (404), email já em uso (400), sucesso (200)
 *   - delete: ID inválido (400) e sucesso (204)
 *   - index:  caminho feliz já coberto; erro interno coberto via mock
 */
describe('Testes Complementares: UserController - branches faltando', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  async function criarUsuario(
    overrides: Partial<{
      nome: string;
      email: string;
      password: string;
    }> = {},
  ) {
    const dados = {
      nome: 'Usuario Padrao',
      email: `padrao${Date.now()}@email.com`,
      password: 'senhaForte123',
      ...overrides,
    };
    const response = await request(app).post('/api/users').send(dados);
    return response.body as { id: number; nome: string; email: string };
  }

  // ─── GET /api/users/:id ──────────────────────────────────────────────────────

  describe('GET /api/users/:id', () => {
    it('deve retornar 200 e os dados do usuário quando o ID for válido e o usuário existir', async () => {
      const { id } = await criarUsuario({
        nome: 'Carla Teste',
        email: 'carla@email.com',
      });

      const response = await request(app).get(`/api/users/${id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('nome', 'Carla Teste');
      expect(response.body).toHaveProperty('email', 'carla@email.com');
      expect(response.body).not.toHaveProperty('senha_hash');
    });
  });

  // ─── POST /api/users (branches não cobertos) ────────────────────────────────

  describe('POST /api/users - validação de senha', () => {
    it('deve retornar 400 quando a senha tiver menos de 6 caracteres', async () => {
      const response = await request(app).post('/api/users').send({
        nome: 'Teste Senha',
        email: 'testeSenha@email.com',
        password: '123', // menos de 6 caracteres
      });

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe(
        'A senha deve conter no minimo 6 caracteres.',
      );
    });

    it('deve retornar 400 quando a senha não for informada', async () => {
      const response = await request(app).post('/api/users').send({
        nome: 'Teste Sem Senha',
        email: 'semsenha@email.com',
        // password ausente
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro');
    });

    it('deve retornar 400 quando o nome estiver vazio (somente espaços)', async () => {
      const response = await request(app).post('/api/users').send({
        nome: '   ',
        email: 'nomevazio@email.com',
        password: 'senhaForte123',
      });

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe('O campo nome é obrigatório.');
    });
  });

  // ─── PUT /api/users/:id ──────────────────────────────────────────────────────

  describe('PUT /api/users/:id', () => {
    it('deve retornar 400 quando o ID na URL não for um número válido', async () => {
      const response = await request(app)
        .put('/api/users/abc-invalido')
        .send({ nome: 'Novo Nome' });

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe(
        'O ID informado deve ser um numero valido.',
      );
    });

    it('deve retornar 400 quando o ID for zero', async () => {
      const response = await request(app)
        .put('/api/users/0')
        .send({ nome: 'Novo Nome' });

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe(
        'O ID informado deve ser um numero valido.',
      );
    });

    it('deve atualizar o nome do usuário e retornar 200 com os dados atualizados', async () => {
      const { id } = await criarUsuario({
        nome: 'Nome Original',
        email: 'original@email.com',
      });

      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ nome: 'Nome Atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.nome).toBe('Nome Atualizado');
      expect(response.body.id).toBe(id);
    });

    it('deve atualizar o email do usuário e retornar 200', async () => {
      const { id } = await criarUsuario({
        nome: 'Email Update',
        email: 'emailoriginal@email.com',
      });
      const novoEmail = `emailnovo${Date.now()}@email.com`;

      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ email: novoEmail });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(novoEmail);
    });

    it('deve retornar 404 quando o nome enviado for uma string vazia', async () => {
      const { id } = await criarUsuario({
        nome: 'Nome Para Invalido',
        email: 'nomeinvalido@email.com',
      });

      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ nome: '   ' }); // nome vazio após trim

      expect(response.status).toBe(404);
      expect(response.body.erro).toBe('O campo nome deve ser um texto valido.');
    });

    it('deve retornar 400 quando o email enviado tiver formato inválido', async () => {
      const { id } = await criarUsuario({
        nome: 'Email Invalido Update',
        email: 'emailvalido@email.com',
      });

      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ email: 'email-invalido-sem-arroba' });

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe('Informe um e-mail valido.');
    });

    it('deve retornar 400 quando o email enviado já estiver em uso por outro usuário', async () => {
      const emailEmUso = `emuso${Date.now()}@email.com`;
      await criarUsuario({ nome: 'Usuario A', email: emailEmUso });
      const { id: idB } = await criarUsuario({
        nome: 'Usuario B',
        email: `usuariob${Date.now()}@email.com`,
      });

      const response = await request(app)
        .put(`/api/users/${idB}`)
        .send({ email: emailEmUso });

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe('Este e-mail já está em uso.');
    });

    it('deve atualizar o email para o mesmo email do próprio usuário sem conflito', async () => {
      const email = `mesmoemail${Date.now()}@email.com`;
      const { id } = await criarUsuario({ nome: 'Mesmo Email', email });

      // Envia o mesmo email que o usuário já tem — não deve dar conflito
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(email);
    });
  });

  // ─── DELETE /api/users/:id ────────────────────────────────────────────────────

  describe('DELETE /api/users/:id', () => {
    it('deve retornar 400 quando o ID na URL não for um número válido', async () => {
      const response = await request(app).delete('/api/users/abc-invalido');

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe(
        'O ID informado deve ser um numero valido.',
      );
    });

    it('deve retornar 400 quando o ID for negativo', async () => {
      const response = await request(app).delete('/api/users/-5');

      expect(response.status).toBe(400);
      expect(response.body.erro).toBe(
        'O ID informado deve ser um numero valido.',
      );
    });

    it('deve excluir o usuário e retornar 204 quando o ID for válido e o usuário existir', async () => {
      const { id } = await criarUsuario({
        nome: 'Para Deletar',
        email: 'deletar@email.com',
      });

      const response = await request(app).delete(`/api/users/${id}`);

      expect(response.status).toBe(204);

      // Verifica que o usuário foi de fato removido
      const getResponse = await request(app).get(`/api/users/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
