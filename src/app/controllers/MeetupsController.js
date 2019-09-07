import * as Yup from 'yup';
import { parseISO, isBefore, subHours, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupsController {
    async index(req, res) {
        const { date, page = 1 } = req.query;
        const parsedDate = parseISO(date);
        const meetup = await Meetup.findAll({
            where: {
                user_id: req.userId,
                date: {
                    [Op.between]: [
                        startOfDay(parsedDate),
                        endOfDay(parsedDate),
                    ],
                },
            },
            order: ['date'],
            attributes: ['id', 'title', 'date', 'description', 'location'],
            limit: 10,
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'organizer',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: File,
                    as: 'banner',
                    attributes: ['id', 'name', 'path', 'url'],
                },
            ],
        });
        return res.json(meetup);
    }

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

        const meetup = await Meetup.create({
            user_id: req.userId,
            title,
            description,
            location,
            date,
        });

        return res.json(meetup);
    }

    async delete(req, res) {
        const meetup = await Meetup.findByPk(req.params.id);
        if (meetup.user_id !== req.userId) {
            return res.status(401).json({
                error: "You Don't permission to cancel this Meetup",
            });
        }

        const dateShorterHour = subHours(meetup.date, 2);

        if (isBefore(dateShorterHour, new Date())) {
            return res.status(401).json({
                error: 'You can only delete Meetup 2 hours in advance',
            });
        }

        await meetup.destroy();

        res.json({
            message: 'This Meetapp was successfully canceled.',
        });
    }
}

export default new MeetupsController();
