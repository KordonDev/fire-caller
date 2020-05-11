const nodeFetch = require('node-fetch');

const token = process.env.TOKEN;
if (!token) {
    throw new Error('Missing token');
}
const knownAlarms: number[] = [];

const loadData = (initalCall?: boolean) => {
    const nowSeconds = new Date().getTime() / 1000;
    nodeFetch(`https://www.divera247.com/api/pull?${nowSeconds.toString()}`, {
        headers: {
            'cookie': token,
            'content-type': 'application/json; charset=UTF-8'
        }
    })
    .catch(console.error)
    .then((res: any) => res.json())
    .then((res: DiveraRespose) => {
        console.log(res.data.cluster.vehicle);
        return res;
    })
    .then((res: DiveraRespose) => res.data.alarm.items)
    .then((alarms: {[ key: string ]: Alarm}) => {
        Object.values(alarms).map(alarm => {
            if (knownAlarms.includes(alarm.id) || initalCall) {
                console.log('Alter Alarm:', alarm.title);
            } else {
                console.log(`
                    --- Neuer Alarm ---
                    ${alarm.id}
                    ${alarm.title}
                    ${alarm.text}
                    ${alarm.ucr_answeredcount['29657']}
                `);
                console.log(alarm.ucr_answeredcount);
                console.log(alarm.vehicle);
                knownAlarms.push(alarm.id);
            }
        });
        console.log('---- New -------');
        console.log('');
        console.log('');
    });
}

const loadVehicles = () => {

}


loadData(true);
setInterval(() => {
    loadData()
}, 20000);

interface DiveraRespose {
    data: {
        ts: number,
        usr_active: number,
        user: {
            firstname: string,
            lastname: string,
        },
        status: {
            status_id: number,
        },
        cluster: {
            name: string,
            vehicle: object,
            vehiclesorting: any[],
        },
        alarm: {
            items: {
                [key: string]: Alarm,
            }
            new: number,
            ts: number,
        }
    }
}

interface Alarm {
    id: number,
    author_id: number,
    address: string,
    new: boolean,
    notification_type: number,
    text: string,
    title: string,
    type: string,
    vehicle: number[],
    lat: number,
    long: number,
    ucr_answered: {},
    ucr_answeredcount: { '29657': number },
}

enum Answer {
    MINUTEN5 = '29657',
    MINUTEN10 = '29658',
    NICHT = '296551',
    URLAUB= '?',
}