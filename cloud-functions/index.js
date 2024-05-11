const {google} = require('googleapis');
const compute = google.compute('v1');

function today() {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0];
}

async function authorize() {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    return await auth.getClient();
}

exports.startFastScrapers = async(req, res) => {
    const project = 'data-u-420919';
    const zone = 'southamerica-west1-a';
    const template = 'projects/data-u-420919/global/instanceTemplates/scraper-v4';

    const date = today()

    const argsPerHost = {
        'remax': `--host=remax --qps=0.1 --sink=prod --pageSize=100 --maxPages=-1`,

        // Re-enable once stable
        // 'zonaprop': `--host=zonaprop --qps=0.03333 --sink=prod --maxPages=-1`,
    }

    const authClient = await authorize()

    for (let host of Object.keys(argsPerHost)) {
        const workloadId = `${host}-${date}`
        const appArgs = argsPerHost[host]

        const instanceName = `fastscraper-${workloadId}-vm`
        const request = {
            project: project,
            zone: zone,
            resource: {
                name: instanceName,
                metadata: {
                    items: [
                        {key: 'startup-script-url', value: 'https://raw.githubusercontent.com/nachogutierrez/data-u/master/startup-scripts/gce-fastscraper-startup.sh'},
                        {key: 'app-args', value: appArgs },
                        {key: 'serial-port-enable', value: '1'}
                    ]
                }
            },
            sourceInstanceTemplate: template,
            auth: authClient,
        };

        try {
            await compute.instances.insert(request)
            console.log(`Workload ${workloadId} started successfully`)
        } catch (err) {
            console.error("Problem with creating instance, Error:", err);
            return res.status(500).send(err.toString());
        }
    }

    res.status(200).send('Instances created successfully');
}

// TODO: Run cloud function on schedule
// TODO: Add cloud function to track completion of workload
exports.startScrapers = async (req, res) => {
    const project = 'data-u-420919';
    const zone = 'southamerica-west1-a';

    // TODO: clean up templates, leave only 1
    const template = 'projects/data-u-420919/global/instanceTemplates/scraper-v4';

    const n = 10
    const pageSize = 100
    const maxPages = -1
    const scraperName = 'remax'
    const uploadStrategy = 'gcloudstorage'

    const workloadId = `${scraperName}-${today()}`

    const authClient = await authorize();

    for (let k = 0; k < n; k++) {
        const instanceName = `scraper-${workloadId}-vm${k}`;

        const request = {
            project: project,
            zone: zone,
            resource: {
                name: instanceName,
                metadata: {
                    items: [
                        {key: 'startup-script-url', value: 'https://raw.githubusercontent.com/nachogutierrez/data-u/master/startup-scripts/gce-scraper-startup.sh'},
                        {key: 'app-args', value: `${n} ${k} ${pageSize} ${maxPages} ${scraperName} ${uploadStrategy}`},
                        {key: 'serial-port-enable', value: '1'}
                    ]
                }
            },
            sourceInstanceTemplate: template,
            auth: authClient,
        };
    
        try {
            const response = await compute.instances.insert(request)
            console.log('Instance created successfully:', response.data);
        } catch (err) {
            console.error("Problem with creating instance, Error:", err);
            return res.status(500).send(err.toString());
        }
    }

    res.status(200).send('Instances created successfully');
};
