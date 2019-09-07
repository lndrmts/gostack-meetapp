import { isBefore } from 'date-fns';
import Registration from '../models/Registration';
import Meetup from '../models/Meetup';

class ResgistrationController {
    async store(req, res) {
        const meetup = await Meetup.findOne({
            where: { id: req.params.meetupId },
        });
        /*
            Check Meetup Exists
        */
        if (!meetup) {
            return res
                .status(401)
                .json({ error: 'This Meetup does not exist' });
        }
        /*
            Check Organizer Meetup
        */
        if (meetup.user_id === req.userId) {
            return res.status(401).json({
                error: "You can't register because you are the organizer",
            });
        }
        /*
            Check for past date
        */
        const hourMeetup = meetup.date;

        if (isBefore(hourMeetup, new Date())) {
            return res
                .status(400)
                .json({ error: 'Too bad this Meetup has happened' });
        }
        /*
            Check user register
        */
        const checkRegisteredUser = await Registration.findOne({
            where: {
                user_id: req.userId,
                meetup_id: req.params.meetupId,
            },
        });

        if (checkRegisteredUser) {
            return res
                .status(401)
                .json({ error: 'You are already registered for this Meetup' });
        }
        /*
            Check register the same hours
        */
        const checkSameHours = await Registration.findOne({
            where: {
                user_id: req.userId,
            },
            include: [
                {
                    model: Meetup,
                    required: true,
                    where: {
                        date: meetup.date,
                    },
                },
            ],
        });

        if (checkSameHours) {
            return res.status(400).json({
                error: 'You already have a date at this time',
            });
        }

        const registration = await Registration.create({
            user_id: req.userId,
            meetup_id: req.params.meetupId,
        });

        return res.json(registration);
    }
}

export default new ResgistrationController();
