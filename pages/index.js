import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, startTransition } from 'react'

export default function Home() {
    const [data, setData] = useState(null);
    const [ofacRate, setOfacRate] = useState(null);
    const [inclusionRate, setInclusionRate] = useState([]);
    const [waitingPeriod, setWaitingPeriod] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshToken, setRefreshToken] = useState(0);
    const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleString());


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
        fetch('/api/mevwatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'startTime': start_time, 'endTime': end_time }),
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setIsLoading(false);
            }
            )
            .finally(() => {
                setTimeout(() => {
                    setLastRefresh(new Date().toLocaleString());
                    setRefreshToken(Math.random());
                }, 30 * 1000);
            }
            );
    }, [refreshToken]);

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
        const inclusion_rates = [0.5, 0.75, 0.9999];

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
        <div className={styles.container} style={{marginTop: '2em'}}>
            {!data ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <div>24h ofacRate: {ofacRate}</div>
                    <br></br>
                    <div>tx inclusion rate per # of blocks</div>
                    {
                        inclusionRate.map((rate, index) => {
                            return <div key={index}>{rate.blocks} .. {rate.rate}</div>
                        })
                    }
                    <br></br>
                    <div>waiting period for tx inclusion rate</div>
                    {
                        waitingPeriod.map((period, index) => {
                            return <div key={index}>{period.rate} .. {period.blocks} blocks .. {period.blocks*12}s</div>
                        })
                    }
                </div>
            )}
            <br></br>
            <div>Last refresh: {isLoading ? "loading..." : lastRefresh}</div>
        </div>
    )
}
