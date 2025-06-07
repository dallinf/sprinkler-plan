export function getStartDateNDaysAgo(days: number): string {
    const now = new Date();
    const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (days - 1)
    );
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, "0");
    const dd = String(start.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
