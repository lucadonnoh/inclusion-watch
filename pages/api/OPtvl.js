import nc from 'next-connect';
import cors from 'cors';

const handler = nc()
    .use(cors())
    .get(async (req, res) => {
        const response = await fetch('https://l2beat.com/api/optimism-tvl.json');
        const data = await response.json();
        res.json(data);
    });

export default handler;