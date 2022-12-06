import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { v4 as uuidv4 } from 'uuid';
import { cors, httpErrorHandler } from 'middy/middlewares'
import { AttachmentUtils } from '../../helpers/attachmentUtils'
import { getUserId } from '../utils'
import { updateAttachmentUrl } from '../../helpers/todos'


const attachmentUtils = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    // ##TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const attachmentId = uuidv4()

    let uploadUrl = await attachmentUtils.createAttachmentPresignedUrl(attachmentId);

    const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)

    await updateAttachmentUrl(userId, todoId, attachmentUrl)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      origin: "*",
      credentials: true
    })
  )
