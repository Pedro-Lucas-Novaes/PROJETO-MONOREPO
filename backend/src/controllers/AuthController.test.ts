import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../app';
import { sequelize } from '../config/database';
import { User } from '../models/User';

describe('Testes de Integração: AuthController (POST /api/auth/login)', () => {
  const EMAIL_TESTE = 'auth.teste@fatec.sp.gov.br';
  const SENHA_TESTE = 'Senha@123';

  beforeAll(async () => {
    // Recria as tabelas no SQLite em memória
    await sequelize.sync({ force: true });

    // Cria um usuário de teste com a senha já hasheada
    const senha_hash = await bcrypt.hash(SENHA_TESTE, 10);
    await User.create({
      nome: 'Usuario Auth Teste',
      email: EMAIL_TESTE,
      senha_hash,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Não limpa entre testes: o usuário de login deve persistir em toda a suíte
  });

  // 1. Sucesso — credenciais corretas devem retornar token JWT
  it('deve retornar status 200 e um token JWT ao fazer login com credenciais válidas', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: EMAIL_TESTE,
      password: SENHA_TESTE,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
    expect(response.body.mensagem).toBe('Login realizado com sucesso!');
  });

  // 2. Campos obrigatórios ausentes — sem email e senha
  it('deve retornar status 400 quando email e senha não forem enviados', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Email e senha são obrigatórios');
  });

  // 3. Email ausente
  it('deve retornar status 400 quando apenas o email estiver ausente', async () => {
    const response = await request(app).post('/api/auth/login').send({
      password: SENHA_TESTE,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
  });

  // 4. Senha ausente
  it('deve retornar status 400 quando apenas a senha estiver ausente', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: EMAIL_TESTE,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
  });

  // 5. Usuário não encontrado
  it('deve retornar status 401 quando o e-mail não pertencer a nenhum usuário', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nao.existe@fatec.sp.gov.br',
      password: SENHA_TESTE,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Credenciais invalidas.');
  });

  // 6. Senha incorreta — usuário existe, mas a senha não bate
  it('deve retornar status 401 quando a senha estiver incorreta', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: EMAIL_TESTE,
      password: 'senha-errada-99',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Credenciais invalidas.');
  });
});
