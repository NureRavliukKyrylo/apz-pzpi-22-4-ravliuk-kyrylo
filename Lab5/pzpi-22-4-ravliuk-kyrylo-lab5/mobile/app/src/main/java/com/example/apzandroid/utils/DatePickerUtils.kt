package com.example.apzandroid.utils

import android.content.Context
import android.widget.Toast
import androidx.fragment.app.FragmentManager
import com.google.android.material.datepicker.MaterialDatePicker
import java.text.SimpleDateFormat
import java.util.*

object DatePickerUtils {

    fun showDateRangePicker(
        context: Context,
        fragmentManager: FragmentManager,
        onDatesSelected: (String, String) -> Unit
    ) {
        val picker = MaterialDatePicker.Builder.dateRangePicker()
            .setTitleText("Choose date range")
            .build()

        picker.show(fragmentManager, "DATE_RANGE_PICKER")

        picker.addOnPositiveButtonClickListener { selection ->
            val startMillis = selection.first
            val endMillis = selection.second

            val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val start = formatter.format(Date(startMillis))
            val end = formatter.format(Date(endMillis))

            Toast.makeText(context, "Chosen: $start — $end", Toast.LENGTH_SHORT).show()
            onDatesSelected(start, end)
        }
    }
}
