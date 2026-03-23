from django.db.models import Count, Avg, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer
from .llm import classify_ticket


@api_view(['GET', 'POST'])
def ticket_list_create(request):
    if request.method == 'POST':
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET with filters
    qs = Ticket.objects.all()

    category = request.query_params.get('category')
    priority = request.query_params.get('priority')
    ticket_status = request.query_params.get('status')
    search = request.query_params.get('search')

    if category:
        qs = qs.filter(category=category)
    if priority:
        qs = qs.filter(priority=priority)
    if ticket_status:
        qs = qs.filter(status=ticket_status)
    if search:
        qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

    serializer = TicketSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
def ticket_detail(request, pk):
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TicketSerializer(ticket, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ticket_stats(request):
    from datetime import timedelta

    total = Ticket.objects.count()
    open_count = Ticket.objects.filter(status='open').count()

    # avg tickets per day using DB aggregation
    if total > 0:
        first_ticket = Ticket.objects.order_by('created_at').first()
        days = max((timezone.now() - first_ticket.created_at).days, 1)
        avg_per_day = round(total / days, 1)
    else:
        avg_per_day = 0.0

    priority_qs = Ticket.objects.values('priority').annotate(count=Count('id'))
    priority_breakdown = {p: 0 for p in ['low', 'medium', 'high', 'critical']}
    for row in priority_qs:
        priority_breakdown[row['priority']] = row['count']

    category_qs = Ticket.objects.values('category').annotate(count=Count('id'))
    category_breakdown = {c: 0 for c in ['billing', 'technical', 'account', 'general']}
    for row in category_qs:
        category_breakdown[row['category']] = row['count']

    return Response({
        'total_tickets': total,
        'open_tickets': open_count,
        'avg_tickets_per_day': avg_per_day,
        'priority_breakdown': priority_breakdown,
        'category_breakdown': category_breakdown,
    })


@api_view(['POST'])
def classify(request):
    description = request.data.get('description', '').strip()
    if not description:
        return Response({'error': 'description is required'}, status=status.HTTP_400_BAD_REQUEST)

    result = classify_ticket(description)
    if result is None:
        return Response(
            {'error': 'Classification unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(result)
