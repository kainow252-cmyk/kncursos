/**
 * Script para migrar senhas de texto plano para bcrypt hash
 * 
 * Este script:
 * 1. Gera hash bcrypt das senhas atuais
 * 2. Atualiza o banco de dados com as senhas hash
 * 3. Valida que o hash funciona corretamente
 */

import bcrypt from 'bcryptjs';

// Senhas atuais (texto plano)
const users = [
  {
    username: 'kncursos',
    password: 'kncursos2024',
    role: 'admin'
  },
  {
    username: 'kncursos-func',
    password: 'kncursos123',
    role: 'employee'
  }
];

async function generateHashes() {
  console.log('🔐 Gerando hashes bcrypt...\n');
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`Usuario: ${user.username} (${user.role})`);
    console.log(`Senha original: ${user.password}`);
    console.log(`Hash bcrypt: ${hash}`);
    
    // Testar se o hash funciona
    const isValid = await bcrypt.compare(user.password, hash);
    console.log(`Validação: ${isValid ? '✅ OK' : '❌ FALHOU'}`);
    console.log('');
  }
  
  console.log('\n📋 Comandos SQL para atualizar o banco:\n');
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`-- Atualizar ${user.username}`);
    console.log(`UPDATE users SET password = '${hash}' WHERE username = '${user.username}';`);
    console.log('');
  }
}

generateHashes().catch(console.error);
