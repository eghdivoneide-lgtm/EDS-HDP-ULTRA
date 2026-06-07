const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const newAliases = `  const mapAliases = {
    'mineiro': 'mg', 'paranaense': 'pr', 'goianiense': 'go', 'américa': 'america', 'atlético': 'atletico', 'athletico': 'athletico', 
    'antiguo aluno de newells': 'newells old boys', 'clube de corridas': 'racing club', 'rio da prata': 'river plate', 
    'sao lourenco': 'san lorenzo', 'são lourenço': 'san lorenzo', 'sao lorenzo': 'san lorenzo', 'ginasio': 'gimnasia', 'ginaiso': 'gimnasia', 
    'defesa e justica': 'defensa y justicia', 'independente': 'independiente', 'quarto': 'cuarto',
    'cordoba central': 'central cordoba', 'tucuman': 'atl. tucuman', 'atletico tucuman': 'atl. tucuman',
    'argentinos juniors': 'argentinos jrs', 'deportivo riestra': 'dep. riestra', 'estudiantes de la plata': 'estudiantes l.p.',
    'estudiantes lp': 'estudiantes l.p.', 'independiente rivadavia': 'ind. rivadavia', 'newell': 'newells old boys'
  };`;

// Use regex to replace the exact line reliably regardless of encoding
const updatedContent = content.replace(/const mapAliases = \{.*?\};/, newAliases);

fs.writeFileSync('index.html', updatedContent, 'utf8');
console.log('Aliases atualizados com sucesso!');
