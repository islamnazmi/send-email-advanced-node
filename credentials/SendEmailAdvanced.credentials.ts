// n8n-nodes-send-email-advanced/credentials/SendEmailAdvanced.credentials.ts

import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SmtpApi implements ICredentialType {
	name = 'smtpApi'; // This must match the 'name' in your node's credentials array
	displayName = 'SMTP API';
	documentationUrl = 'https://example.com/smtp-api-docs'; // Optional: Link to documentation
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
			placeholder: 'smtp.example.com',
			description: 'SMTP server host',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 587,
			description: 'SMTP server port (e.g., 587 for TLS, 465 for SSL)',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: '',
			placeholder: 'your-email@example.com',
			description: 'SMTP username (usually your email address)',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true }, // This makes it a password field in the UI
			default: '',
			description: 'SMTP password or app-specific password',
		},
	];
}
