import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, startTransition } from 'react'
import Slider from '@mui/material/Slider';
import { Typography, Container, Divider, Skeleton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { makeStyles } from '@mui/styles';
import humanizeDuration from 'humanize-duration';

const useStyle = makeStyles({
    mark: {
        color: "white"
    }
});

export default function Home() {
    const [data, setData] = useState(null);
    const [ofacRate, setOfacRate] = useState(null);
    const [inclusionRate, setInclusionRate] = useState([]);
    const [waitingPeriod, setWaitingPeriod] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleString());
    const [sliderValue, setSliderValue] = useState(0);

    const handleSliderChange = (event, newValue) => {
        setSliderValue(newValue);
        // setOfacRate(newValue / 100)
    };

    const classes = useStyle();

    const calculateOfacCompliantRate = (data) => {
        var censoredBlocks = 0;
        for (var relayStat of data.relayStats) {
            if (relayStat.isOfacCensoring) {
                censoredBlocks += relayStat.numBlocks;
            }
        }
        return (censoredBlocks / data.totalBlocks);
    }

    useEffect(() => {
        setIsLoading(true);
        // 1 day period in seconds
        const end_time = new Date().getTime() / 1000;
        const start_time = end_time - 24 * 60 * 60;

        const fetchData = async () => {
            setIsLoading(true);
            const response = await fetch('/api/mevwatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'startTime': start_time, 'endTime': end_time }),
            })
            const data = await response.json();
            setData(data);
            setIsLoading(false);
        }

        fetchData();

        const t = setInterval(() => {
            fetchData();
            setLastRefresh(new Date().toLocaleString());
        }, 30 * 1000);

        return () => clearInterval(t);
    }, []);


    useEffect(() => {
        if (data) {
            startTransition(() => {
                setOfacRate(calculateOfacCompliantRate(data));
            }
            );
        }
    }, [data]);

    useEffect(() => {
        const block_intervals = [1, 5, 10, 25];
        const inclusion_rates = [0.25, 0.5, 0.75, 0.9999];

        var inclusionRates = [];
        for(var interval of block_intervals) {
            var tx_inclusion_rate = 1-(ofacRate**interval);
            inclusionRates.push({blocks: interval, rate: tx_inclusion_rate});
        }
        setInclusionRate(inclusionRates);

        var waitingPeriods = [];
        for(var rate of inclusion_rates) {
            var waiting_period = Math.ceil(Math.log(1-rate)/Math.log(ofacRate));
            waitingPeriods.push({rate: rate, blocks: waiting_period});
        }
        setWaitingPeriod(waitingPeriods);
    }, [ofacRate]);

    return (
        <Container className={styles.container} style={{marginTop: '2em'}}>
            {!data ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <Container maxWidth="lg">
                        <Typography variant="h2" textAlign="center" fontWeight="700">INCLUSION RATE</Typography>
                        {/* animated keyframes gradient text */}
                        <Typography variant="h1" textAlign="center" className="linear-wipe" fontWeight="700">{(100*ofacRate).toFixed(2)}%</Typography>
                        <Typography variant="h6" textAlign="center">daily avg OFAC compliant nodes</Typography>
                    </Container>
                    <br></br>
                    {
                        ofacRate ? <Slider
                            aria-label="Temperature"
                            defaultValue={ofacRate * 100}
                            valueLabelDisplay="auto"
                            marks
                            min={0}
                            max={100}
                            color="secondary"
                            classes={{ markLabel: classes.mark }}
                            value={sliderValue}
                            onChange={handleSliderChange}
                        /> : <></>
                    }
                    <br></br>
                    <Divider sx={{
                        "&::before, &::after": {
                        borderColor: "#6272a4",
                        },
                        mt: "2em"
                    }}>what is the probability that my tx will be included after N blocks?</Divider>
                    <br></br>
                    <Typography textAlign="center"></Typography>
                    <Grid container spacing={12}>
                        {
                            inclusionRate.map((rate, index) => {
                                return <Grid xs key={index}>
                                            <Typography textAlign="center">{rate.blocks} {rate.blocks > 1 ? 'BLOCKS' : 'BLOCK'} </Typography>
                                            <Typography variant="h5" textAlign="center" fontWeight="500">{(100*rate.rate).toFixed(2)}%</Typography>
                                            <Typography textAlign="center">{rate.blocks*12 <= 36 ? '🚀' : rate.blocks*12 <= 90 ? '🚗' :  rate.blocks*12 <= 210 ? '🛵' : '🐌'} — {humanizeDuration(rate.blocks*12*1000)}</Typography>
                                        </Grid>
                            })
                        }
                    </Grid>
                    
                    <br></br>
                    <Divider sx={{
                        "&::before, &::after": {
                        borderColor: "#6272a4",
                        },
                        mt: "2em"
                    }}>how much do i have to wait to have a P% of probability to include my OFAC violating tx?</Divider>
                    <br></br>
                    <Grid container spacing={12}>
                        {
                            waitingPeriod.map((period, index) => {
                                return <Grid xs key={index}>
                                        <Typography textAlign="center">{(100*period.rate).toFixed(2)}%</Typography>
                                        <Typography variant="h5" textAlign="center" fontWeight="500">{period.blocks} {period.blocks > 1 ? 'BLOCKS' : 'BLOCK'}</Typography>
                                        <Typography textAlign="center">{period.blocks*12 <= 36 ? '🚀' : period.blocks*12 <= 90 ? '🚗' :  period.blocks*12 <= 210 ? '🛵' : '🐌'} — {humanizeDuration(period.blocks*12*1000)}</Typography>
                                    </Grid>
                            })
                        }
                    </Grid>
                </div>
            )}
            <br></br>
            <Container sx={{ mt: '2em' }}><Typography textAlign="center">Last update: {isLoading ? "loading..." : lastRefresh}</Typography></Container>
        </Container>
    )
}
