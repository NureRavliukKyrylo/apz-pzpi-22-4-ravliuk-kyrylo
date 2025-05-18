package com.example.apzandroid.helpers.notifications

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.models.notification_models.NotificationsResponse
import com.example.apzandroid.utils.ConvertDp
import kotlin.math.abs
import kotlin.math.min

class SwipeToDeleteCallback(
    private val context: Context,
    private val notificationList: MutableList<NotificationsResponse>,
    private val csrfToken: String,
    private val onDelete: (Int) -> Unit
) : ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT) {

    private val deleteIcon: Drawable? = ContextCompat.getDrawable(context, R.drawable.bin_delete)
    private val background = ColorDrawable(Color.RED)
    private val swipeThreshold = 0.5f

    override fun onMove(
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder,
        target: RecyclerView.ViewHolder
    ) = false

    override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
        val position = viewHolder.adapterPosition
        val notification = notificationList[position]
        NotificationHelper.deleteNotificationById(notification.id, csrfToken, context, {
            notificationList.removeAt(position)
            onDelete(position)
        }, {
            Toast.makeText(context, "Notification deleted", Toast.LENGTH_SHORT).show()
        })
    }

    override fun onChildDraw(
        c: Canvas,
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder,
        dX: Float,
        dY: Float,
        actionState: Int,
        isCurrentlyActive: Boolean
    ) {
        val itemView = viewHolder.itemView

        val maxSwipe = itemView.width * swipeThreshold
        val restrictedDx = if (dX < -maxSwipe) -maxSwipe else dX

        if (restrictedDx < 0) {
            background.setBounds(
                itemView.right + dX.toInt(),
                itemView.top,
                itemView.right,
                itemView.bottom
            )
            background.draw(c)

            deleteIcon?.let {
                val iconSize = ConvertDp.dpToPx(context, 50)
                val iconMargin = (itemView.height - iconSize) / 2
                val iconTop = itemView.top + iconMargin
                val iconLeft = itemView.right - iconMargin - iconSize
                val iconRight = itemView.right - iconMargin
                val iconBottom = iconTop + iconSize

                val swipeProgress = abs(dX) / itemView.width
                val scale = min(1f, 0.5f + swipeProgress)

                val saveCount = c.save()
                c.scale(scale, scale, iconLeft + iconSize / 2f, iconTop + iconSize / 2f)

                it.setBounds(iconLeft, iconTop, iconRight, iconBottom)
                it.draw(c)

                c.restoreToCount(saveCount)
            }
        } else {
            background.setBounds(0, 0, 0, 0)
        }

        super.onChildDraw(c, recyclerView, viewHolder, dX, dY, actionState, isCurrentlyActive)
    }


    override fun clearView(recyclerView: RecyclerView, viewHolder: RecyclerView.ViewHolder) {
        super.clearView(recyclerView, viewHolder)
        background.setBounds(0, 0, 0, 0)
    }
}