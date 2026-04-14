const Expense = require("../models/expense");

exports.downloadReport = async (req, res) => {
    try {
        const type = req.query.type || "all";
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            where: { UserId: userId }
        });

        const now = new Date();

        const filtered = expenses.filter(exp => {
            const d = new Date(exp.createdAt);

            if (type === "daily") {
                return d.toDateString() === now.toDateString();
            }

            if (type === "weekly") {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return d >= weekAgo;
            }

            if (type === "monthly") {
                return d.getMonth() === now.getMonth() &&
                       d.getFullYear() === now.getFullYear();
            }

            if (type === "yearly") {
                return d.getFullYear() === now.getFullYear();
            }

            return true;
        });

        // CSV creation
        let csv = "Amount,Description,Category,Date\n";

        filtered.forEach(exp => {
            csv += `${exp.amount},${exp.description},${exp.category},${exp.createdAt}\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=expense-report-${type}.csv`
        );

        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate report" });
    }
};