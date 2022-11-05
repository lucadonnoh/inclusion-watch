import { Container, Typography, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub'

export default function Footer() {
    return (
        <Container sx={{ mt: '1em' }}>
            <Typography textAlign="center" mt="1em">Built by <Link href="https://twitter.com/donnoh_eth" color="#ff79c6" target="_blank" rel="noreferrer">donnoh.eth</Link> & <Link href="https://twitter.com/emilianobonassi" color="#ff79c6" target="_blank" rel="noreferrer">emiliano.eth</Link> - data provided by <Link href="https://mevwatch.info" color="#ff79c6" target="_blank" rel="noreferrer">mevwatch.info</Link></Typography>
            <Typography textAlign="center" mt="1em"><Link href="https://github.com/lucadonnoh/inclusion-watch" color="#ff79c6" target="_blank" rel="noreferrer"><GitHubIcon/></Link></Typography>
        </Container>
    );
}