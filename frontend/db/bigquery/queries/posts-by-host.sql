select host, DATE(timestamp) as date, count(*) as amount from `housing.datapoints`
where host = '{{host}}'
group by date, host
order by date desc, host;