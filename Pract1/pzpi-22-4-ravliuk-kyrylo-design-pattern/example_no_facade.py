from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Integer, create_engine, ForeignKey
from sqlalchemy.orm import relationship

# Створення базового класу для всіх ORM-моделей
Base = declarative_base()

# Модель рейсу (Flight) — таблиця з інформацією про рейси
class Flight(Base):
    __tablename__ = 'flights'
    flight_number = Column(String, primary_key=True)
    origin = Column(String)
    destination = Column(String)
    price = Column(Integer)

# Модель платежу (Payment) — таблиця з інформацією про платежі
class Payment(Base):
    __tablename__ = 'payments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Integer)
    flight_number = Column(String, ForeignKey('flights.flight_number'))
    flight = relationship("Flight")

# Модель квитка (Ticket) — таблиця з оформленими квитками
class Ticket(Base):
    __tablename__ = 'tickets'
    id = Column(Integer, primary_key=True, autoincrement=True)
    flight_number = Column(String, ForeignKey('flights.flight_number'))
    flight = relationship("Flight")

# Створення вбудованої SQLite бази даних в оперативній пам’яті
engine = create_engine("sqlite:///:memory:", echo=True)

# Створення сесії для взаємодії з БД
Session = sessionmaker(bind=engine)
session = Session()

# Сервіс для пошуку рейсів
class FlightSearch:
    def find_flights(self, origin, destination):
        print(f"Searching flights from {origin} to {destination}")
        return session.query(Flight).filter_by(origin=origin, destination=destination).all()

# Сервіс для обробки платежів
class PaymentProcessing:
    def process_payment(self, amount, flight):
        print(f"Processing payment of ${amount} for flight {flight.flight_number}")
        payment = Payment(amount=amount, flight_number=flight.flight_number)
        session.add(payment)
        session.commit()
        return payment

# Сервіс для оформлення квитків
class Ticketing:
    def issue_ticket(self, flight):
        print(f"Issuing ticket for {flight.flight_number}")
        ticket = Ticket(flight_number=flight.flight_number)
        session.add(ticket)
        session.commit()
        return ticket


if __name__ == "__main__":
    # Створюємо таблиці у базі даних
    Base.metadata.create_all(engine)
    
    # Ініціалізуємо окремі підсистеми
    search = FlightSearch()
    payment = PaymentProcessing()
    ticketing = Ticketing()
    
    """
    На даний момент клієнтський код напряму взаємодіє з кожною підсистемою.
    Для реалізації Facade патерну можна створити окремий клас (наприклад, BookingFacade),
    який інкапсулює взаємодію між пошуком, оплатою і оформленням квитка.
    """

    flights = search.find_flights("New York", "London")
    if flights:
        selected_flight = flights[0]
        print(f"Selected flight: {selected_flight.flight_number}")
        payment.process_payment(selected_flight.price, selected_flight)
        ticketing.issue_ticket(selected_flight)
    else:
        print("No flights found.")
