#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log('Testing Eventbrite MCP Server...\n');
// Set test environment variables
process.env.EVENTBRITE_API_KEY = 'test_key_for_validation';
const serverPath = join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
});
let output = '';
let errorOutput = '';
server.stdout.on('data', (data) => {
    output += data.toString();
});
server.stderr.on('data', (data) => {
    errorOutput += data.toString();
});
// Send a list tools request
const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
};
setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 100);
setTimeout(() => {
    server.kill();
    console.log('Server stderr output:');
    console.log(errorOutput);
    console.log('\nServer stdout output:');
    console.log(output);
    if (output.includes('create_event') && output.includes('list_events')) {
        console.log('\n✅ Test passed! Server is responding with expected tools.');
    }
    else {
        console.log('\n❌ Test failed! Server did not respond with expected tools.');
    }
}, 2000);
server.on('error', (error) => {
    console.error('Failed to start server:', error);
});
