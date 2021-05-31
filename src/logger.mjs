import winston from 'winston'
const { createLogger, format, transports } = winston
const { combine, timestamp, printf } = format
const printMetadata = metadata => metadata ? `[${JSON.stringify(metadata)}]` : ''
const logFormat = printf(({ level, message, timestamp, metadata }) => {
  if (metadata && metadata.product) return `${timestamp} [${level}]: ${metadata.product} - ${message} ${printMetadata(metadata)}`;
  return `${timestamp} [${level}]: ${message} ${printMetadata(metadata)}`
})

const logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    format.splat(),
    format.colorize(),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: logFormat,
      handleExceptions: true
    }),
    new transports.File({
      filename: 'process.log',
      format: combine(
        timestamp(),
        format.splat(),
        format.uncolorize(),
        logFormat)
    })
  ]
})

export default logger
