import { ChildProcess, spawn } from 'child_process'
import { userInfo } from 'os'
import { Observable } from 'rxjs'

export interface Next {
  origin: 'stdout' | 'stderr'
  output: string | ChildProcess
}

export class ReactiveSpawn {
  private _shell = userInfo().shell

  reactify(command: string, options?: { runInBackground }) {
    return new Observable<Next>((subscriber) => {
      const childProcess = spawn(command, { ...options, shell: this._shell })

      if (options && options.runInBackground) {
        subscriber.complete()
      }

      childProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString()
        subscriber.next({ origin: 'stdout', output })
      })
      
      childProcess.stderr.on('data', (data: Buffer) => {
        const output = data.toString()
        subscriber.next({ origin: 'stderr', output })
      })

      childProcess.on('exit', (code) => {
        if (!code) {
          subscriber.complete()
        } else {
          subscriber.error()
        }
      })
    })
  }
}
