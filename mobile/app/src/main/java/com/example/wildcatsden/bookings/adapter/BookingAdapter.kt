package com.example.wildcatsden.bookings.adapter

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.R
import com.example.wildcatsden.bookings.Booking

class BookingAdapter(
    private var items: List<Booking>,
    private val onEditClick: (Booking) -> Unit,
    private val onCancelClick: (Booking) -> Unit
) : RecyclerView.Adapter<BookingAdapter.VH>() {

    class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvEvent: TextView = view.findViewById(R.id.tvEventName)
        val tvVenue: TextView = view.findViewById(R.id.tvVenueName)
        val tvDateTime: TextView = view.findViewById(R.id.tvDateTime)
        val tvStatus: TextView = view.findViewById(R.id.tvStatus)
        val btnEdit: Button = view.findViewById(R.id.btnEdit)
        val btnCancel: Button = view.findViewById(R.id.btnCancel)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_booking, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val b = items[position]
        holder.tvEvent.text = b.eventName ?: "(untitled)"
        holder.tvVenue.text = b.venueName ?: ""

        val date = b.date ?: ""
        val time = b.timeSlot ?: ""
        holder.tvDateTime.text = "$date • $time"

        val status = b.status?.lowercase() ?: "pending"
        holder.tvStatus.text = status.uppercase()
        
        // Color coding status
        when (status) {
            "approved" -> holder.tvStatus.setTextColor(Color.parseColor("#2E7D32"))
            "pending" -> holder.tvStatus.setTextColor(Color.parseColor("#F57C00"))
            "rejected" -> holder.tvStatus.setTextColor(Color.parseColor("#C62828"))
            "canceled" -> holder.tvStatus.setTextColor(Color.parseColor("#757575"))
            else -> holder.tvStatus.setTextColor(Color.GRAY)
        }

        // Only allow edit/cancel if pending
        if (status == "pending") {
            holder.btnEdit.visibility = View.VISIBLE
            holder.btnCancel.visibility = View.VISIBLE
        } else {
            holder.btnEdit.visibility = View.GONE
            holder.btnCancel.visibility = View.GONE
        }

        holder.btnEdit.setOnClickListener { onEditClick(b) }
        holder.btnCancel.setOnClickListener { onCancelClick(b) }
    }

    override fun getItemCount(): Int = items.size

    fun update(newItems: List<Booking>) {
        items = newItems
        notifyDataSetChanged()
    }
}
