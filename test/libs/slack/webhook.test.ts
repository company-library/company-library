import { notifySlack } from '@/libs/slack/webhook'

describe('notifySlack function', () => {
  vi.stubEnv('SLACK_WEBHOOK_URL', 'slack-webhook-url')

  it('Slackのwebhookがキックされる', async () => {
    const expectedText = 'sample message'
    const sendMock = vi.fn()
    vi.spyOn(require('@slack/webhook'), 'IncomingWebhook').mockImplementation(() => {
      return {
        send: sendMock,
      }
    })

    await notifySlack(expectedText)

    expect(sendMock).toBeCalledWith({
      username: 'company-librarian',
      icon_emoji: ':teacher:',
      text: expectedText,
    })
  })

  it('blocks でメッセージを送ることができる', async () => {
    const expectedText = 'sample message'
    const expectedBlocks = [
      {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: 'Basic bullet list with rich elements\n',
              },
            ],
          },
          {
            type: 'rich_text_list',
            style: 'bullet',
            elements: [
              {
                type: 'rich_text_section',
                elements: [
                  {
                    type: 'text',
                    text: 'item 1: ',
                  },
                  {
                    type: 'emoji',
                    name: 'basketball',
                  },
                ],
              },
              {
                type: 'rich_text_section',
                elements: [
                  {
                    type: 'text',
                    text: 'item 2: ',
                  },
                  {
                    type: 'text',
                    text: 'this is a list item',
                  },
                ],
              },
              {
                type: 'rich_text_section',
                elements: [
                  {
                    type: 'text',
                    text: 'item 3: ',
                  },
                  {
                    type: 'link',
                    url: 'https://slack.com/',
                    text: 'with a link',
                    style: {
                      bold: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const sendMock = vi.fn()
    vi.spyOn(require('@slack/webhook'), 'IncomingWebhook').mockImplementation(() => {
      return {
        send: sendMock,
      }
    })

    await notifySlack(expectedText, expectedBlocks)

    expect(sendMock).toBeCalledWith({
      username: 'company-librarian',
      icon_emoji: ':teacher:',
      text: expectedText,
      blocks: expectedBlocks,
    })
  })
})
