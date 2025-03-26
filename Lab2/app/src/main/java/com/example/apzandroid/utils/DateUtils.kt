package com.example.apzandroid.utils

import java.text.SimpleDateFormat
import java.util.*

object DateUtils {

    fun parseDate(dateString: String): String {
        return try {
            val cleanedDate = dateString.trim().removeSurrounding("\"")
            val inputFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val outputFormat = SimpleDateFormat("dd MMM yyyy HH:mm", Locale.getDefault())

            val date = inputFormat.parse(cleanedDate) ?: return cleanedDate
            outputFormat.format(date)
        } catch (e: Exception) {
            println("Date parsing failed for '$dateString': ${e.message}")
            dateString
        }
    }
}
