import os from "os";

/**
 * Logs the CPU clock speed for each core in GHz.
 */
function displayCpuClockSpeed(): void {
  const cpus = os.cpus();

  cpus.forEach((cpu, index) => {
    const speedGHz = (cpu.speed / 1000).toFixed(2); // Convert MHz to GHz
    console.log(`Core ${index + 1}'s Clock Speed: ${speedGHz} GHz`);
  });
}

/**
 * Logs the system specifications to the console.
 */
function displaySystemSpecs(): void {
  console.log("System Specifications:");
  console.log("----------------------");
  console.log(`Operating System: ${os.type()} ${os.release()}`);
  console.log(`Hostname: ${os.hostname()}`);
  console.log(`CPU Architecture: ${os.arch()}`);
  console.log(`CPU Cores: ${os.cpus().length}`);
  displayCpuClockSpeed();
  console.log(`0.1 vCPU Clock Speed: ${os.cpus().length}`);
  console.log(`Total Memory: ${(os.totalmem() / 1024 ** 3).toFixed(2)} GB`);
  console.log(`Free Memory: ${(os.freemem() / 1024 ** 3).toFixed(2)} GB`);
  console.log(`Uptime: ${(os.uptime() / 3600).toFixed(2)} hours`);
  console.log(`Network Interfaces:`);

  const networkInterfaces = os.networkInterfaces();
  for (const [name, interfaces] of Object.entries(networkInterfaces)) {
    console.log(`  ${name}:`);
    interfaces?.forEach((iface) => {
      console.log(`    Address: ${iface.address}`);
      console.log(`    Family: ${iface.family}`);
      console.log(`    Internal: ${iface.internal}`);
    });
  }
}

export default displaySystemSpecs;
