const {google} = require('googleapis');
const compute = google.compute('v1');

exports.startScrapers = async (req, res) => {
    const project = 'data-u-420919';
    const zone = 'southamerica-west1-a';
    const template = 'projects/data-u-420919/global/instanceTemplates/scraper-v2'; 

    const n = 2

    async function authorize() {
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        return await auth.getClient();
    }

    const authClient = await authorize();

    for (let k = 0; k < n; k++) {
        // Generate a random instance name
        const instanceBaseName = 'scraper';
        const instanceName = `${instanceBaseName}-${Math.floor(Math.random() * 1000000)}`;

        const request = {
            project: project,
            zone: zone,
            resource: {
                name: instanceName,
                metadata: {
                    items: [
                        {key: 'startup-script-url', value: 'https://raw.githubusercontent.com/nachogutierrez/data-u/master/gcp-ce-startup.sh'},
                        {key: 'NODE_APP_ARGS', value: `${n} ${k} 10 4 remax gcloudstorage`},
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
            res.status(200).send('Instance created successfully');
        } catch (err) {
            console.error("Problem with creating instance, Error:", err);
            res.status(500).send(err.toString());
        }
    }
};
