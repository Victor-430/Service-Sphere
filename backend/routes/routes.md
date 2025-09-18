// should i have a standalone enpoint for services,reviews,verification,dispute, analytics,messages or it should be with the experts enpoints

// enpoints for service sphere

// api/service
// POST (create service )
// GET ( service )
// PUT ( service )
// DELETE ( service )

// api/reviews
// POST (user review)
// GET (user review)
// PUT (user review)
// DELETE (user review)

// api/verification
// POST (expert document, certification verfication)
// GET (expert document, certification verfication)
// PUT (expert document, certification verfication)
// DELETE (expert document, certification verfication)

// api/analytics
// should be based on overall data on the databse

// api/messages
// endpoint for communication btween clients and experts

// api/user
// POST (register user) [/register]
// POST (login user) [/login]
// PUT (update user profile) [/profile]
// DELETE (delete user account) [/profile]
// GET (browse service requests) [api/service]
// POST (apply to service ) [api/service]
// POST,GET (secure messaging) [/message]
// POST (ratings and reviews system) [api/review]

// api/expert
// POST (register experts) bio,skills,certificatons [/register]
// POST (login experts) [/login]
// PUT (update expert profile) [/profile]
// DELETE (delete expert account) [/profile]
// POST (create service) [api/service]
// POST (respond to requests from clients) [api/service]
// POST (upload documents for verification) [api/verification]
// GET ( download documents uploaded) [api/verification]
// GET (track active engagments) [/engagement]
// GET (ratings and reviews system) [api/reviews]
// POST,GET (secure messaging) [api/message]

// api/admin
// POST (register admin) [/register]
// POST (login admin) [/login]
// PUT (update admin profile) [/profile]
// GET (all users and experts) [api/users, api/experts]
// GET ( download documents for verification and approval) [api/verification ]
// GET (oversights of service postings and communication) [api/services, api/messages]
// GET (analytics and usage reports) [api/analytics]
// GET (dispute management and system notification) [api/dispute]

// {admin access for users and experts}
// api/users
// GET (get all users)
// DELETE (all users)

// api/experts
// GET (get all experts)
// DELETE (all experts)
