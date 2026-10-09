import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import { authMiddleware } from './authMiddleware';
import { JWT_SECRET } from '../config/auth';
import { sequelize } from '../config/database';

// Cria um mini-app Express com uma rota protegida apenas para os testes do middleware
function buildTestApp() {
  const testApp = express();
  testApp.use(express.json());

  testApp.get('/protected', authMiddleware, (req: Request, res: Response) => {
    res
      .status(200)
      .json({ mensagem: 'acesso autorizado', user: (req as any).user });
  });

  return testApp;
}

const testApp = buildTestApp();

describe('Testes de Unidade: authMiddleware', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // 1. Sem cabeçalho Authorization
  it('deve retornar 401 quando nenhum token for enviado na requisição', async () => {
    const response = await request(testApp).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Token não fornecido.');
  });

  // 2. Cabeçalho presente mas sem o prefixo "Bearer "
  it('deve retornar 401 quando o token não usar o formato "Bearer <token>"', async () => {
    const response = await request(testApp)
      .get('/protected')
      .set('Authorization', 'TokenSemPrefixo algum-valor');

    expect(response.status).toBe(401);
    expect(response.body.erro).toBe('Token não fornecido.');
  });

  // 3. Token com assinatura inválida
  it('deve retornar 401 quando o token tiver assinatura inválida', async () => {
    const response = await request(testApp)
      .get('/protected')
      .set('Authorization', 'Bearer token.invalido.assinatura');

    expect(response.status).toBe(401);
    expect(response.body.erro).toBe('Token invalido ou expirado.');
  });

  // 4. Token expirado
  it('deve retornar 401 quando o token estiver expirado', async () => {
    // Gera token que já expirou há 1 segundo
    const tokenExpirado = jwt.sign(
      { id: 1, email: 'test@test.com', nome: 'Test' },
      JWT_SECRET,
      { expiresIn: -1 }, // expirado imediatamente
    );

    const response = await request(testApp)
      .get('/protected')
      .set('Authorization', `Bearer ${tokenExpirado}`);

    expect(response.status).toBe(401);
    expect(response.body.erro).toBe('Token invalido ou expirado.');
  });

  // 5. Token válido — deve passar pelo middleware e chegar ao handler
  it('deve chamar next() e disponibilizar os dados do usuário em req.user quando o token for válido', async () => {
    const payload = {
      id: 42,
      email: 'valido@fatec.sp.gov.br',
      nome: 'Usuario Valido',
    };
    const tokenValido = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const response = await request(testApp)
      .get('/protected')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(response.status).toBe(200);
    expect(response.body.mensagem).toBe('acesso autorizado');
    expect(response.body.user).toMatchObject({
      id: 42,
      email: 'valido@fatec.sp.gov.br',
      nome: 'Usuario Valido',
    });
  });
});
