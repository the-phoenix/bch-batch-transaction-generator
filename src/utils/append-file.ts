import { appendFile } from 'fs'
import { bindNodeCallback } from 'rxjs'

function appendFileNode(filePath: string, line: string, cb: (err, data: string) => void) {
  return appendFile(filePath, line, err => {
      cb(err, line);
  });
}

const _appendFile = bindNodeCallback(appendFileNode);

export function appendFileObs(filePath: string, line: string) {
  return _appendFile(filePath, line);
}