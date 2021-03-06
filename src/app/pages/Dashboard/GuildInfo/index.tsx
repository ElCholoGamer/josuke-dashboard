import axios from 'axios';
import { stringify } from 'querystring';
import React from 'react';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import { Guild } from '../../../utils';
import './GuildInfo.scss';

interface Props {
	guild: Guild;
	accessToken: string;
}

const GuildInfo: React.FC<Props> = ({ guild, accessToken }) => {
	const history = useHistory();

	const { name, botAvailable } = guild;
	const handleClick = (
		e: React.MouseEvent<HTMLElement, MouseEvent>,
		redirect: boolean
	) => {
		e.preventDefault();
		// Go to dashboard
		if (redirect) {
			history.push(`/dashboard/${guild.id}`);
			return;
		}

		// Open invite window
		const width = 450;
		const left = innerWidth / 2 - width / 2;

		const { protocol, hostname } = location;
		const win = open(
			`/oauth/invite?${stringify({
				response_type: 'code',
				redirect_uri: `${protocol}//${hostname}/close`,
				guild_id: guild.id,
			})}`,
			'Invite Josuke',
			`scrollbar=yes,width=${width},height=${innerHeight},top=5,left=${left}`
		);

		// Wait until window closes
		const timer = setInterval(async () => {
			if (!win?.closed) return;
			clearInterval(timer);

			// Fetch new bot guilds
			const { data: newGuilds } = await axios.get('/api/guilds', {
				headers: { Authorization: accessToken },
			});

			// Check if bot was added
			if (newGuilds.some((g: Guild) => g.id === guild.id && g.botAvailable)) {
				history.push(`/dashboard/${guild.id}`);
			}
		}, 500);
	};

	return (
		<div className="guild-info">
			<h3 className="text-light">{name}</h3>
			<Button
				className="guild-button"
				onClick={e => handleClick(e, botAvailable)}
				variant={botAvailable ? 'darker' : 'purple'}>
				{botAvailable ? 'Go to Dashboard' : 'Invite to Server'}
			</Button>
		</div>
	);
};

export default GuildInfo;
