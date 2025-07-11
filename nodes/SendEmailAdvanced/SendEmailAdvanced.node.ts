import { INodeExecutionData, INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';
import nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer/lib/mailer'; // Import SendMailOptions for better type safety

export class SendEmailAdvanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Send Email Advanced',
		name: 'sendEmailAdvanced',
		group: ['output'],
		version: 1,
		description: 'Send Email with Headers, Draft, and Reply',
		defaults: {
			name: 'Send Email Advanced',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [ // Use n8n's Credentials for sensitive info
			{
				name: 'smtpApi', // This name should match the credential type you define
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Send', value: 'send' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Reply', value: 'reply' },
				],
				default: 'send',
				description: 'Choose the action type',
			},
			{
				displayName: 'From Email', // Added new parameter for explicit 'From' address
				name: 'fromEmail',
				type: 'string',
				default: '',
				description: 'Sender email address (e.g., "Your Name <your@example.com>")',
			},
			{
				displayName: 'To Email',
				name: 'toEmail',
				type: 'string',
				default: '',
				description: 'Recipient email address',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Email subject',
			},
			{
				displayName: 'Email Text',
				name: 'emailText',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Plain text content of the email',
			},
			{
				displayName: 'Email HTML',
				name: 'emailHtml',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'HTML content of the email',
			},
			{
				displayName: 'Thread ID',
				name: 'threadId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['reply'],
					},
				},
				description: 'Message-ID to use for In-Reply-To and References headers',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get SMTP credentials from n8n's credential store
		const credentials = await this.getCredentials('smtpApi');
		const smtpHost = credentials.host as string;
		const smtpPort = credentials.port as number;
		const user = credentials.user as string;
		const password = credentials.password as string;

		// Create transporter once outside the loop for efficiency
		// Note: Nodemailer's createTransport might throw, but it's typically
		// caught during workflow testing if credentials are bad from the start.
		const transporter = nodemailer.createTransport({
			host: smtpHost,
			port: smtpPort,
			secure: smtpPort === 465, // Use SSL if port is 465
			auth: {
				user,
				pass: password,
			},
		});

		for (let i = 0; i < items.length; i++) {
			const action = this.getNodeParameter('action', i) as string;
			const fromEmail = this.getNodeParameter('fromEmail', i) as string; // Get the new 'From' email
			const toEmail = this.getNodeParameter('toEmail', i) as string;
			const subject = this.getNodeParameter('subject', i) as string;
			const emailText = this.getNodeParameter('emailText', i) as string;
			const emailHtml = this.getNodeParameter('emailHtml', i) as string;
			const threadId = this.getNodeParameter('threadId', i, '') as string;

			// Define mail options with explicit type
			const mailOptions: SendMailOptions = {
				from: fromEmail, // Use the new 'fromEmail' parameter
				to: toEmail,
				subject: action === 'reply' ? `Re: ${subject}` : subject,
				text: emailText,
				html: emailHtml || undefined, // Only include HTML if it has a value
			};

			if (action === 'reply' && threadId) {
				mailOptions.headers = {
					'In-Reply-To': threadId,
					'References': threadId,
				};
			}

			let success = false;
			let errorMessage: string | undefined;

			try {
				if (action !== 'draft') {
					await transporter.sendMail(mailOptions);
					success = true;
				} else {
					success = true; // Drafting is considered a success without sending
				}
			} catch (error) {
				success = false;
				errorMessage = (error as Error).message; // Capture the error message
				this.logger.error(`Error sending email: ${errorMessage}`); // Log the error
			}

			returnData.push({
				json: {
					success,
					action,
					toEmail,
					subject: mailOptions.subject,
					sent: action !== 'draft' && success, // 'sent' is true only if action is not draft AND sending succeeded
					error: errorMessage, // Include error message in output
				},
			});
		}

		return [returnData];
	}
}

