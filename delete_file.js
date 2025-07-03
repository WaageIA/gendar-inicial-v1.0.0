import fs from 'fs';
const filePath = 'D:/DEV VIBE CODE/GEMINI CLI/unhas-client-rating-app-main (1)/unhas-client-rating-app-main/src/pages/Automation.tsx';

fs.unlink(filePath, (err) => {
  if (err) {
    console.error(`Erro ao deletar o arquivo: ${err.message}`);
  } else {
    console.log(`Arquivo ${filePath} deletado com sucesso.`);
  }
});