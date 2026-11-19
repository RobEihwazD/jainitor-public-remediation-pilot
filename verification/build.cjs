// Task-declared build: compile the public server and the selected data-access module.
const esbuild = require('esbuild');
esbuild.buildSync({entryPoints:['server.js','app/data/memos-dao.js'],outbase:'.',outdir:'dist',platform:'node',target:'node22',format:'cjs',bundle:true,packages:'external',logLevel:'warning'});
