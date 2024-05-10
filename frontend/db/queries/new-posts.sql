select event_date as date, host as name, count(*) as value from `housing.events`
where event = "NEW_POST"
group by event_date, host
order by event_date desc