import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectId = 'data-u-420919'
const secrets = [
  'AUTH_SECRET',
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'BIGQUERY_PROJECT_ID',
  'BIGQUERY_CLIENT_EMAIL',
  'BIGQUERY_PRIVATE_KEY'
];

const client = new SecretManagerServiceClient();

function accessSecretVersion(name) {
  return client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`,
  })
    .then(([version]) => {
      const payload = version.payload.data.toString('utf8');
      return payload;
    })
    .catch(error => {
      console.error(`Failed to fetch secret ${name}:`, error);
      throw error;
    });
}

function fetchSecrets() {
  const secretPromises = secrets.map(secretName =>
    accessSecretVersion(secretName).then(secretValue => ({
      name: secretName.toUpperCase(),
      value: secretValue
    }))
  );

  return Promise.all(secretPromises)
    .then(secretValues => {
      let envContent = '';
      secretValues.forEach(secret => {
        envContent += `${secret.name}=${secret.value}\n`;
      });
      return envContent;
    })
    .catch(error => {
      console.error('Error fetching secrets:', error);
      throw error;
    });
}

function writeEnvFile() {
  fetchSecrets()
    .then(envContent => {
      const envFilePath = resolve(__dirname, '.env');
      return fs.writeFile(envFilePath, envContent);
    })
    .then(() => {
      console.log('env file written successfully');
    })
    .catch(error => {
      console.error('Error writing env file:', error);
    });
}

writeEnvFile();
