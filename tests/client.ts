/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, Networks, Currencies, } from '../src'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })

  if (event.type === 'service_connect' && event.payload) run()
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    currency: Currencies.Bitcoin,
    debug: 4,
    respondAs: Responses.Callback,
    eventBus,
    authDetails,
    network: Networks.Testnet,
  },
  true, //  replace previous instances
  'https://testapi.kirobo.me',
)

// main function
async function run(): Promise<void> {
  try {
    // const res = await service.getUtxos(['3KMEqBay4AoCB8HMTPVXnEdC1vE1uJxVXE'], { respondDirect: true })
    const res1 = await service.getStatus()

    console.log(res1)
    // const res2 = await service.getKiroState('0x081afafbb054846ad131eb35149164b2ce5d0390')
    // const res2 = await service.getKiroPrice('0x2ffBCAE868B67D96a1307aFa4F3Dbb08C928C2E0')

    const res = await service.estimateFees({
      ownerId: '635dc3a95bc3a57f0ac385c2b3c39d7ac3b0c2b3c39d50c395c29535c3a4c2a5c2815006c38a1c11c383c3a7c3ba3bc39f00c2',
      to: '0x081afafbb054846ad131eb35149164b2ce5d0390',
      amount: 100000,
    })

    // const res = await service.getBalance('0x081afafbb054846ad131eb35149164b2ce5d0390')

    console.log(res)
    // console.log(res2)
  } catch (err) {
    console.log('error happened')
    console.log(err)
    service.getConnectionStatus()
  }
}

function getAddresses() {
  return '2MxFc8s4KvBy6TjGZP5eHS64mL6Dy3KWCtF;2N4tBS877JevcQU4Lwn91HT1nExB6YS4ciu;2N7Eso8VCcKLi9cH4jqSXWrhM18ZzxwEiVC;2N4wZDncVG8VrKwKrnjjFhxy7S9xyZXc5nq;2N841N8ndSNeE6d3aPJN6zUEAXEq29VDDrD;2Mz8aL4CG8qETcVEkiFUX5uvCuBRUmnnTnh;2NAtJKxLRxWvKsiX5hFLqNnQqE8yxShEpFs;2N9kmS9shUrz7YnZu26XH2eYShXkyr6SbR1;2N5WYgyTdKt25xjSV2pKjj4U7pRdk7uPu6a;2NBZfXanZXMjJ9AHfHfeJHTptjFWi1F5y9f;2MtCqpAbkrZ5PFooDu4B1Kxh7MiuKPxoJo4;2NCBHF1fKbrwCdDA25CJwtjaE5ZacjnAFDR;2NCvQp9k9TsTbYpFaC1GBSaVFXXPJmQ1qti;2MuZrg3QQapa5TpW8tUuzafwNsqNFwohAWW;2NEtzSgtXNq44V5R2fsRd3fZE344k9EfhEH;2N3DXvtJsSZtxbJHkXWTnbYmhtXfxoSHPzd;2NGSB566yagqxdi4s6FWhfaCw3W8uRSdxqL;2N6G56mB98cZ9zwUT3t5JVTpEtsXRWRZgv5;2NBK2GNrjEkrU2ftTY1zg8phy5QTc3Nds7z;2NC54vgrnZuT1aTHEZSwpfegU9Wg4oLYVTc;2Mv72RFrcSduHr9jj6JBzucEEgZ6aRyb8Co;2NBDYiPcTWWWmwz6ynq9piyfz6KVmVnkSY2;2N76KhDbNpsvq1ohsGWYEoBATAEoRaHK8An;2NFmU4ymGVNyoWAeZBpCRsn147VvzUSnPuX;2MzCWy6YqbMm6vofdy729opBaJYknCQXGqt;2Mz5ZDL37T2DQaqJQ9UfoY6Jn8jjeNgP5m9;2MteuviHuwAugxq3bHVyjD1ScT4zdNCVZRu;2N3KiykYC2UoFCdXePMAYjDzpuuq9NCjJ3s;2MsbiY7vpLMJa7nJpf5tP3qzrEUBdYfX9Yi;2N9EVLhNfDr6BVwUqQQAaTjcj9ZccWJs78K;2N9sAECr4PfRAm2v3hVgRTrzgKbL9t4nRj8;2NEPZad4Xed6veQpekq5oMxWjiQT1ebwDKA;2NASyYpRtQcVDRweQJbVkUo57VTk51LRTcn;2N6mwikRzkinWrDvhKaNYAegYwQdM4c3Vso;2N9czuqFnQW614MjkKzxmtJ2x3Jqnnb8hZE;2MuCtgrGGviE1Pz6wvqjozH3vPQCrbHdsMA;2NGDkS6UxipkiSS9xAMnT84Lkf7ZJxtqVX4;2MxX9aAr6FjebzYHPwfiHVBDZvuYZNa5xpZ;2MsSemkjTB3u58YEaW4PTKwkerhzLWGpTzw;2Mtp7aBdDymFVaJwFLadUxkixoHQHK6gceF;2MtkVQ7iZXNT7fXzKEH4L7saYBGWLujByGb;2Mw3wAN5yekuM8LysPBieD1ADUXcnDPvUMd;2MyyBXG4jK18cLiMdpGqV2R1djMxiTMEAUH;2N7edKeYxJLpBFP9yrbKUCXhvWnCtwwXSNU;2N7nxqxJS7pmnjhBZi5pF7f6bL2zR3cJwxJ;2N5c3F3apuQxAAhgYm2FEzyZcbqFaWSQ6Zi;2N9VBhr9FeHvGDVPxP4sMF2mKJbZhZqivz8;2N86a5ELcUezvUEKrJk7SYX7oz4tayFbcup;2MvTt6igD1dGHj2fiytRZ52WvgccHqRmLVm;2MxcXNATodfnKTwweadvLcYSezLDqzmp7VS;2N1SZFtDLVtLympZRpa72SFdXfN1YfPkM3e;2NDaLwrJ6cBnisUEAhTTRGGPzccJLrK6LcE;2NAMsPX6VE87JzNvikfoXpdHRyp4qEzmGnC;2MvjAXyytUo4umkqr15dwpmngeXJwb58ZSY;2Myj2ChMUes7Uf3zxoy2brCXBSUtrfPMU3Z;2Mzc9hWqB2StKhoQiJ6t3mkSfhK2qYyw6f2;2NE1EeHA4yhHuKuQbKsiJfG8fjtzsgS3jNT;2MwuchEvH4AdvHumg7UFFubC5L72dUxQFW7;2N3dYoTfr17oG6BfMBMgGxxv5dbsy3wJ4JK;2N3Z2BXv4UQiAWuR3HMTr7pAeNdo5Zx4ynj;2N8coo4TLsAdCGn13ZxTdHMFJ9TqvkGiSQ1;2N2rzVkXrtfSYY621mZ9ksKFAdSVYLCCGV8;2Mwbb6tH3u4jQSXn13AYDVBbxBKvjG24Whe;2NEF2X6cfSmrA8P4xMd5ea9M34DEFnDUqsU;2MuGrTtzHFHMN8cqCBU5BVk8kDJmKnQHX6A;2NDjrGKJRbf4K6ZkhWXWFp42piSaYBcNnWa;2Mys1ZtFFytowJTCxPMZtyydPs7xKMBPHBr;2NAFSQ8RsTQbZ7rhf9oeGJ88LD6Db6XHPSS;2Mz1wXgbeHgbAdVE6t1H7AvtAC15m9W1Tzy;2Muwjm3eBkveQJfdTh1sEGhoLpXz6JBazcW;2NBseQPT3a8LmTMHko6TdnTBwFAyftaowvv;2MuC6c8xSSrijWuu9eHyuotm5WHpsFLmSUC;2NEfWCQLn23MzK8xMV9eZnkyefxdqnxanso;2N76cSrtGjKNvZNXGLhFizXdFhnBmqKLa34;2NEKZjhDVbbq9Kz6Sxg6E7N2DhfTKxReXYv;2NAmfJEsC6eJzHGry17yG9im2b9M7sbgBAk;2MwzLRcCCkcN9Cm4HGDmz9ez7ULMCD52yy4;2NFwMywSaKWtt6ZujgT9gmv2Wi4F3G1aABF;2N7RPp2M2p9Bme25rnDe6JGQLUh379vcwEz;2N5TknbFxRAqpbyam4iC4DTYqC9QGh1xSKG;2N9MinAqSFheXdTEKcssPsWdNPSq8FToRAV;2N4HD3kMq1jgLzUYkSMQrfw8KDydzoBFgE9;2MtNSHMGkwA25zpcSmfYHk9JkWBfPhzycF1;2ND9zCkDG2Sm1bHa3an5fqkLb744XNxPhmD;2Mz4esriTUpjbwhvaCbFpsT32c317PdCTpL;2NCydQXsTEH2WNyKQXG6xCbWQHPU1FSy3EA;2NEHyVkAL9kBZR31QqbhEawJS7nxFJfS1ra;2Mx3ZSqbw7iDhmETME6awfpjQYaqpoUDhav;2Mxkm7iDy8G44K72ZYf8VujRhu7NZJuGVus;2N2kAQtN3xbe29YH3ixHUVa98Q9c1JP32Ay;2MzrW9Je8Lxzry1t7Dp8qaFFKek3UvD8Srr;2N9YjjNfnAENhDmCNqktkut1mfWEa7u451a;2N4HEW7Qk1pXJCLyxDDBbxVxicUV5ZKb36q;2N9m8KucUGVvQWMnGbS8ZjR4YkELSAfRLgG;2N3PQdCCtE8vv7ud5nNvkPtJhgzj9CtPbnq;2NAsFPgmpv9rjuLzfTQEkjwYUXvvYjupDfQ;2NB9icpZsdheAjYJkZGAwzjrsHgnECUuFDF;2N6Q9mPVnWm9K4bmycbExxdP16X2rHqaYfL;2N6qYSMSvf62yLKHERh1W4h2L5G5EVESJTQ;2MthGp9FoRKTd8Jcb2DGioFiUaAyPJeMUmj;2MzifjxMYU3AAnP28HWbEegNr84KnQLMYLT;2NEjyiHLNK175eoF9hvJek2n9gECG4qFiwz;2MzjDDnMykTdf6w3ZLvgQ6T7sN9W2YBtWXA;2N6kMHG8vkFzLCGJtQPPZzn37frVJwJs8TH;2MzUuHXUXbXdEJu14bHqAUx1fZFv616Kp41;2NGV1AsNFGST27MAMXZTkAdC9ZXgssaVQ5B;2N6eZ729URNNx17VciXCJ7yHY2xJFZx6MKV;2NFYv8hzkgWtvHfxGsoVkdxN2yV7GNQe3Ah;2N3yibq9WmMfxXcpxWKt5hMgyCqkLazw34n;2N8FG9pX8gTkGWdFRtT2psSZg97KgtZngWH;2Mt4hMTkYggwwSxDHRiNo6Ga42ejqMyKhXd;2N2bGPcF6JSVruLwraZoiGs77qVipSjztr5;2MwZ7nF8WgEYySuDFeYpe73PQZLbq263mAh;2N2HrPpQ8ai1PRGVVv4jpB6sxkZ3AXUpfUL;2MvuyyAUNHnT1rLzSqGqXWQ9VzZJmLf92zv;2N4Ubf3MAbXUtTaA1ab8p7mDg8bqNqntQJb;2NDwsboAa1yzcByaDwdmErzUAdEymWAqHhB;2Mu2s31Big4Z3nUiPBKz5DTzhshnk3mQtjJ;2MypDugvtZkbSPPTFs4ogNenWUEnAxRBQSU;2N4W3pMPxjgraj9vd2YfhbdugizAbhhRZgJ'.split(
    ';',
  )
}
