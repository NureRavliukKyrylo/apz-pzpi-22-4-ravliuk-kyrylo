package com.example.apzandroid.utils
import android.content.Context

object ConvertDp {

    fun dpToPx(context: Context, dp: Int): Int {
        return (dp * context.resources.displayMetrics.density).toInt()
    }
}
