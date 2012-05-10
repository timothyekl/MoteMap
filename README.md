This file functions as the instructions for replicating this repo. It will become a lab eventually.

# Set up PostgreSQL

First choose client: VM or other host. For VM, skip this section. If other host:

1. In VM, establish a TCP port forwarding from 127.0.0.1:5432 to <guest IP>:5432.
2. Install PostgreSQL on client.
3. Run:
    psql -h localhost -U tele task
4. Use `\d` to list tables. Find the `node_health` table.
5. Run the following query to find most recent node health:
    select distinct on (nodeid) * from node_health order by nodeid, result_time desc;

# Get a data connector app

1. Get Ruby, Sinatra, all that jazz
2. Install this webapp
