import * as Yup from 'yup';
import { parseISO, isBefore } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupsController {
    async store(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            description: Yup.string().required(),
            location: Yup.string().required(),
            date: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation is fails' });
        }
        const { title, description, location, date } = req.body;

        /*
            Check for past date
        */
        const hourMeetup = parseISO(date);

        if (isBefore(hourMeetup, new Date())) {
            return res.status(400).json({ error: 'Past date is not permited' });
        }

        /*
            Check availability
        */

        const availability = await Meetup.findOne({
            where: {
                user_id: req.userId,
                date: hourMeetup,
            },
        });

        if (availability) {
            return res.status(400).json({ error: 'Meetup date not available' });
        }
        console.log(req.userId);
        const meetup = await Meetup.create({
            user_id: req.userId,
            title,
            description,
            location,
            date,
        });

        return res.json(meetup);
    }
}

export default new MeetupsController();
