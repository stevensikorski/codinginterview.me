// Formats date and time for convenience 
const estDate = {
    timeZone: 'America/New_York', // This corresponds to EST/EDT depending on daylight saving time
    hour12: true, // Use 12-hour clock with AM/PM
    weekday: 'long', // Optional: show the full weekday name (e.g., Monday)
    year: 'numeric', // Show the full year (e.g., 2023)
    month: 'long', // Show the full month name (e.g., February)
    day: 'numeric', // Show the day of the month (e.g., 15)
    hour: 'numeric', // Show the hour
    minute: 'numeric', // Show the minute
    second: 'numeric', // Show the second
}
  

// Human-Readable version of current time in EST
const getCurrDateTime = (unixTimestamp) => {
    return (new Date().toLocaleString('en-US', estDate))
};

export { getCurrDateTime }