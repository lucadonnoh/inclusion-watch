// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import nc from 'next-connect';
import cors from 'cors';

const handler = nc()
    .use(cors())
    .post(async (req, res) => {
        const response = await fetch('https://www.mevwatch.info/api/blockStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        }
        );
        const data = await response.json();
        res.json(data);
    });

export default handler;