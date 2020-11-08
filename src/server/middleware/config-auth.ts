import { RequestHandler } from 'express';
import { asyncHandler, isAdmin } from '../util/utils';
import fetch from 'node-fetch';

const configAuth: RequestHandler = asyncHandler(async (req, res, next) => {
	const {
		query: { guild_id },
		headers: { authorization },
	} = req;

	if (!guild_id)
		return res.status(400).json({
			status: 400,
			message: 'Guild ID not provided',
		});

	if (!authorization)
		return res.status(403).json({
			status: 403,
			message: '"Authorization" header not provided',
		});

	// Get user guilds
	const guilds: any[] = await (
		await fetch('https://discord.com/api/users/@me/guilds', {
			headers: { Authorization: authorization },
		})
	).json();

	// Check if user has access to guild and is administrator
	const guild = guilds.find((guild: { id: string }) => guild.id === guild_id);
	if (!guild || !isAdmin(guild.permissions))
		return res.status(403).json({
			status: 403,
			message: 'Invalid "authorization" header',
		});

	req.headers.guildName = guild.name;
	next();
});

export default configAuth;
