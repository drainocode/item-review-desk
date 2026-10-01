// Sample content for the Contact Centre Associate exam.
// Items are original, written for this project.

type Opt = [text: string, correct?: boolean, whyWrong?: string]
type Seed = {id: string; obj: string; level: string; stem: string; options: Opt[]; rationale: string; state: string; author: string}

export const exam = {
  _id: 'exam-cca1',
  _type: 'exam',
  title: 'Contact Centre Associate, Level 1',
  slug: {_type: 'slug', current: 'contact-centre-associate-1'},
  audience: 'New front-line agents in their first 90 days, voice and chat.',
  passMark: 70,
}

export const objectives = [
  {_id: 'obj-cs-1-1', code: 'CS-1.1', statement: 'Open a contact and establish the customer\'s need using questioning and active listening.'},
  {_id: 'obj-cs-1-2', code: 'CS-1.2', statement: 'Handle an unhappy or repeat-contact customer without escalating the conflict.'},
  {_id: 'obj-cs-1-3', code: 'CS-1.3', statement: 'Apply identity checks and data protection rules before discussing an account.'},
  {_id: 'obj-cs-1-4', code: 'CS-1.4', statement: 'Close a contact, set expectations and record it so the next agent can follow on.'},
]

export const blueprint: [string, number][] = [
  ['obj-cs-1-1', 4],
  ['obj-cs-1-2', 4],
  ['obj-cs-1-3', 3],
  ['obj-cs-1-4', 3],
]

export const items: Seed[] = [
  {
    id: 'item-01', obj: 'obj-cs-1-1', level: 'apply', state: 'approved', author: 'writer.one@example.com',
    stem: 'A chat customer writes: "My order is wrong again." Which reply gathers the most useful information in one message?',
    options: [
      ['Sorry about that. Which item is wrong, and what did you expect instead?', true],
      ['Sorry about that. Can I have your order number so I can look into it?', false, 'The order number helps, but it does not tell the agent what went wrong, so another message is needed.'],
      ['I understand how frustrating that must be, and I am here to help you today.', false, 'Empathy without a question stalls the chat and the customer still has to explain.'],
      ['Have you checked the packing slip in the box against your order?', false, 'It implies the customer made a mistake before the agent knows the facts.'],
    ],
    rationale: 'One open question about what is wrong plus what was expected gives the agent the gap to fix. The other replies either need a follow-up or put the customer on the defensive.',
  },
  {
    id: 'item-02', obj: 'obj-cs-1-1', level: 'understand', state: 'approved', author: 'writer.one@example.com',
    stem: 'Which behaviour best shows active listening on a voice call?',
    options: [
      ['Summarising the problem back in your own words and asking if it is right', true],
      ['Staying silent until the customer has completely finished', false, 'Silence can mean listening, but the customer has no evidence the agent understood.'],
      ['Typing notes while saying "okay" every few seconds', false, 'Filler words do not confirm understanding.'],
      ['Repeating the customer\'s last sentence word for word', false, 'Parroting can sound mechanical and does not check understanding.'],
    ],
    rationale: 'A summary in the agent\'s own words proves understanding and lets the customer correct it before time is spent on the wrong fix.',
  },
  {
    id: 'item-03', obj: 'obj-cs-1-1', level: 'apply', state: 'in_review', author: 'drafting-agent',
    stem: 'A caller opens with a long story about a delivery. What should the agent do while the caller is speaking?',
    options: [
      ['Note the key facts (dates, item, what went wrong) and wait for a natural pause to confirm them', true],
      ['Interrupt early to ask for the account number so the system is ready', false, 'Interrupting a customer who is mid-story usually lengthens the call and raises tension.'],
      ['Start searching the knowledge base for delivery policies', false, 'Searching before the problem is clear often finds the wrong article.'],
      ['Ask the caller to email the details instead', false, 'It moves the effort back to the customer and adds a second contact.'],
    ],
    rationale: 'Capturing facts while listening means the agent can confirm the problem accurately at the first pause, without making the caller repeat it.',
  },
  {
    id: 'item-04', obj: 'obj-cs-1-2', level: 'apply', state: 'approved', author: 'writer.two@example.com',
    stem: 'A caller says the same fault has happened three times this month and they are tired of explaining it. What should the agent do FIRST?',
    options: [
      ['Acknowledge the repeat problem and read the notes from earlier contacts', true],
      ['Start the standard troubleshooting script from step one to be thorough', false, 'Repeating steps already tried is the main complaint of repeat callers.'],
      ['Offer a goodwill credit straight away to calm the situation down', false, 'Compensation before understanding the fault can look like a brush-off and may not be justified.'],
      ['Transfer the call to the technical team so a specialist can take it', false, 'A transfer before checking history often means the customer explains a fourth time.'],
    ],
    rationale: 'Reading the contact history avoids repeating failed fixes and shows the customer they do not have to start again.',
  },
  {
    id: 'item-05', obj: 'obj-cs-1-2', level: 'analyse', state: 'approved', author: 'writer.two@example.com',
    stem: 'An angry customer swears at the product, not at the agent, while describing a failed payment. What is the most suitable response?',
    options: [
      ['Keep helping, acknowledge the frustration and focus on the payment', true],
      ['Warn the customer that the call will end if the language continues', false, 'Most policies reserve warnings for abuse aimed at the agent; this can escalate a customer who is venting.'],
      ['End the call and log it as abusive under the conduct policy', false, 'The language was not directed at the agent, so ending the call is out of proportion.'],
      ['Ask a team leader to take over the call before going further', false, 'Escalating before trying to help removes the chance to resolve it at first contact.'],
    ],
    rationale: 'Frustration aimed at a situation is normal; acknowledging it and moving to the fix usually lowers the temperature. Warnings are for abuse aimed at the agent.',
  },
  {
    id: 'item-06', obj: 'obj-cs-1-2', level: 'apply', state: 'changes_requested', author: 'drafting-agent',
    stem: 'A customer asks for a refund that policy does not allow. What should the agent say?',
    options: [
      ['Explain what can be done instead and why the refund is not available', true],
      ['Say "that is company policy" and move on', false],
      ['Promise to ask a manager even though the answer will be no', false],
    ],
    rationale: 'Leading with alternatives keeps the customer engaged even when the main request is refused.',
  },
  {
    id: 'item-07', obj: 'obj-cs-1-3', level: 'remember', state: 'approved', author: 'writer.one@example.com',
    stem: 'Before discussing any account details on an inbound call, what must the agent complete?',
    options: [
      ['The identity and verification steps set by the organisation', true],
      ['A satisfaction survey opt-in', false, 'Survey consent has nothing to do with account access.'],
      ['A check that the caller is using a registered phone number only', false, 'A known number alone is not verification; numbers can be spoofed.'],
      ['A summary of the caller\'s last three contacts', false, 'History is reviewed after the caller is verified, not instead of it.'],
    ],
    rationale: 'Account details are personal data. Verification comes first so information is only shared with the account holder or an authorised person.',
  },
  {
    id: 'item-08', obj: 'obj-cs-1-3', level: 'apply', state: 'in_review', author: 'drafting-agent',
    stem: 'A caller says they are ringing for their elderly father and want to know his balance. The father is not listed as having an authorised contact. What should the agent do?',
    options: [
      ['Explain that the balance cannot be shared and describe how the account holder can add an authorised person', true],
      ['Share the balance because the caller knows the account number', false, 'Knowing an account number does not make someone authorised.'],
      ['Ask the caller to put the father on the line briefly and then carry on with the caller', false, 'Verification of the holder does not authorise a third party to receive details afterwards unless the holder consents on record.'],
      ['End the call without explanation', false, 'The caller should leave knowing the legitimate route to help.'],
    ],
    rationale: 'Without an authority on the account the agent cannot disclose details, but should give the caller the process to set one up.',
  },
  {
    id: 'item-09', obj: 'obj-cs-1-3', level: 'understand', state: 'draft', author: 'writer.two@example.com',
    stem: 'Which of these is not personal data?',
    options: [
      ['A customer\'s email address'],
      ['The branch opening hours', true],
      ['All of the above'],
    ],
    rationale: 'Opening hours.',
  },
  {
    id: 'item-10', obj: 'obj-cs-1-4', level: 'apply', state: 'approved', author: 'writer.one@example.com',
    stem: 'An engineer visit is booked for Thursday. Which closing statement sets the clearest expectation?',
    options: [
      ['The engineer will come Thursday, 8am to 1pm, and you will get a text an hour before', true],
      ['Someone from our team will be in touch with you soon to sort it all out', false, 'Vague timing is the most common cause of a chase-up call.'],
      ['The engineer is booked, so there is nothing else you need to do now', false, 'It skips the time window and the reminder, so the customer does not know when to be home.'],
      ['I have raised a ticket and the team will take it from here for you', false, 'It describes the internal process, not what the customer will experience.'],
    ],
    rationale: 'Specific time windows and the next contact point stop repeat calls asking "when is someone coming?".',
  },
  {
    id: 'item-11', obj: 'obj-cs-1-4', level: 'apply', state: 'approved', author: 'writer.two@example.com',
    stem: 'Which contact note would let another agent pick up the case without calling the customer back?',
    options: [
      ['Card declined twice by bank. Customer updated card, payment retried and taken. Receipt emailed as asked.', true],
      ['Customer called about a problem with their payment. Sorted it out for them.', false, 'It does not say what the problem was or what was done.'],
      ['Customer very angry about the payment issue and it took ages to calm down.', false, 'Opinion without facts does not help the next agent.'],
      ['See previous notes. Customer happy at the end of the call, no further action.', false, 'The next agent learns nothing about this contact.'],
    ],
    rationale: 'A good note records the problem, the action taken, the outcome and any promise made, in plain words.',
  },
  {
    id: 'item-12', obj: 'obj-cs-1-1', level: 'understand', state: 'approved', author: 'writer.two@example.com',
    stem: 'Why is a closed question useful near the end of establishing a customer\'s need?',
    options: [
      ['It confirms a specific detail quickly once the overall problem is clear', true],
      ['It lets the customer explain the problem in their own words', false, 'That describes an open question.'],
      ['It shows empathy for the customer\'s situation', false, 'Empathy comes from acknowledgement, not question type.'],
      ['It avoids the need to take notes', false, 'Notes are still needed whatever the question type.'],
    ],
    rationale: 'Open questions uncover the problem; closed questions confirm the details once the picture is clear.',
  },
]
