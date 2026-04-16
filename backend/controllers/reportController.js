const Expense = require("../models/expense");

exports.downloadReport = async (req, res) => {
    try {
        const type = req.query.type || "all";
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            where: { UserId: userId }
        });

        const now = new Date();

        // 🔍 Filter based on type
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

        // 📊 CALCULATE TOTALS

        const weeklyTotal = expenses
            .filter(exp => {
                const d = new Date(exp.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return d >= weekAgo;
            })
            .reduce((sum, exp) => sum + Number(exp.amount), 0);

        const monthlyTotal = expenses
            .filter(exp => {
                const d = new Date(exp.createdAt);
                return d.getMonth() === now.getMonth() &&
                       d.getFullYear() === now.getFullYear();
            })
            .reduce((sum, exp) => sum + Number(exp.amount), 0);

        const yearlyTotal = expenses
            .filter(exp => {
                const d = new Date(exp.createdAt);
                return d.getFullYear() === now.getFullYear();
            })
            .reduce((sum, exp) => sum + Number(exp.amount), 0);

        // 🧾 CSV CREATION

        let csv = "";

        // Title
        csv += `Report Type: ${type}\n\n`;

        // Summary
        csv += `Weekly Total: ${weeklyTotal}\n`;
        csv += `Monthly Total: ${monthlyTotal}\n`;
        csv += `Yearly Total: ${yearlyTotal}\n\n`;

        // Table Header
        csv += "Amount,Description,Category,Date\n";

        // Data Rows
        filtered.forEach(exp => {
            const d = new Date(exp.createdAt);
            const dateOnly = d.toISOString().split("T")[0];

            csv += `${exp.amount},${exp.description},${exp.category},${dateOnly}\n`;
        });

        // 📤 Send file
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