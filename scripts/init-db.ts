import { createUser } from '@/domains/users/repositories/user.repository';

async function initializeDatabase() {
  try {
    // Criar usuário teste
    const testUser = await createUser(
      'test-user-1',  // uid
      'test@example.com', // email
      {
        name: 'Usuário Teste',
        planName: 'FREE',
        subscriptionStatus: null,
      }
    );

    console.log('✅ Usuário teste criado com sucesso:', testUser);

  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
}

// Executar inicialização
initializeDatabase();