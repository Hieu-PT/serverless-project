
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJbYYyozX+j1vhMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1xczNuYzQ0NW9oeW8xNWVkLnVzLmF1dGgwLmNvbTAeFw0yMjEyMDIx
MjAzMzJaFw0zNjA4MTAxMjAzMzJaMCwxKjAoBgNVBAMTIWRldi1xczNuYzQ0NW9o
eW8xNWVkLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMg44P3T/UyDBgjFr4lxAXtJkRn9tt2gBMi3OYsccGrSS7tLoLsky8XsV1ZW
Zl5zsBqL38QqGqqHmH50Yvruht67iYfRRvEMPki5xS/CcGUIqEFW3Xbnc/KslS0W
xCUJfZV/rNpQI58Fw2bsF0pGQs0N2ztoP8qZEgOvC7rUDTZRfBpuiXSfmeVeZ4Gu
/JE/Yt6ZQX23KGOQM5j4UGOknCavJ8ZWz5s+Y6NZzxI3GH+inIYGaHysDBF5T1W/
VHDAQkbUNpzSe7PaVOwCX0aTkfyDdOl5ElPQ2Tk2lOqjmARMaxQS2gV8ejqllmQa
x54vITk6iutbaKJ8oo+OEMgbbgECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUEkENqwITac+exMFTNEBPM2YlMFMwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBIUFUXhDM7/Dj9py/9l6t+0znTkLuLmhNtPidtKiOE
6HvdaXm0jkGXRLh7QUBcH00MbMSdE989GxwZl7mf2wPVW6Ab/k9wr3WFYL6sbnhu
duyPr0b4ZpNBLVy3YabAS2pc/RZf4BItnrDiZvLmkpbpQnOMg1rfp3BpsDod+TEF
x37MTUihpfVj+LbYurWw96idWW4zAPwEBWLjxAvawZQjS1YiLEk59VAGGQbTLQi4
ckeUKxNEzflvwOUzdONjglnq6dZyp3fR++BfACO7s7c9pPneZmlvRN1HPX7u5s0d
3jYSSSdkF7CokO91t28w5f6sXFayURuKMoa7ow7Y1oiA
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
